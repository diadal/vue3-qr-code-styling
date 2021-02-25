<template>
  <components
    :is="tag"
    v-bind="$attrs"
    >
    <slot
      v-bind="this._self"
      name="prev"/>
    <slot
      v-if="state === 'beforeStart'"
      v-bind="this._self"
      name="before"/>
    <slot
      v-if="state === 'preheat'"
      v-bind="this._self"
      name="preheat"/>
    <slot
      v-if="state === 'process' || state === 'stopped' || state === 'paused'"
      v-bind="this._self"
      name="process"/>
    <slot
      v-if="state === 'finished'"
      v-bind="this._self"
      name="finish"/>
    <slot
      v-bind="this._self"
      name="default"/>
  </components>
</template>

<script lang="ts">
import {
  defineComponent, nextTick, ref, watch, toRefs
// getCurrentInstance
} from 'vue'

// interface ProData {
//   startTime:string|number|Date;
//   endTime:string|number|Date;
//   leftTime:number;
//   autoStart:boolean;
//   speed:number;
//   tag:string;

// }

export default defineComponent({
  name: 'vac',
  props: {
    startTime: {
      type: [String, Number, Date],
      default: null
      // validator: function (value: string| number | Date) {
      //   return new Date(value).toString() !== 'Invalid Date'
      // }

    },
    endTime: {
      type: [String, Number, Date],
      default: null
      // validator: function (value: string| number | Date) {
      //   return new Date(value).toString() !== 'Invalid Date'
      // }

    },
    leftTime: {
      type: Number,
      default: 0
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 1000
      // validator: function (value:number) {
      //   return value >= 0
      // }

    },
    tag: {
      type: String,
      default: 'span'
    }
  },
  setup (props, context) {
    // const bor = getCurrentInstance()
    const state = ref('beforeStart') // beforeStart stopped process finished
    const attrs = ref({})
    const actualStartTime = ref(0)
    const actualEndTime = ref(0)
    const timeObj = ref({
      org: {

        d: '', h: '', m: '', s: '', ms: 0
      },
      ceil: { d: 0, h: 0, m: 0, s: 0 }
    })
    const countdownTimer = ref(0)
    const runTimes = ref(0)
    const usedTime = ref(0)
    const remainingTime = ref(0)
    const prodata = toRefs(props)

    function useStartCountdown (restart:boolean) {
      // const vm = this
      if (state.value !== 'beforeStart' && state.value !== 'stopped' && state.value !== 'paused' && !restart) {
        return
      }
      if (restart) {
        // Object.assign(box.$data, box.$options.data.call())
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // const ds = (bor !== null) ? bor.data.call(context, null) : null
        // Object.assign(bor, ds)
        context.emit('start', context)
      }
      remainingTime.value = 0
      if (state.value === 'stopped') {
        const rem = (actualEndTime.value ? (actualEndTime.value - new Date().getTime()) : 0)
        remainingTime.value = rem
      }
      if (!actualEndTime.value) {
        actualEndTime.value = (Number(prodata.endTime) || (Number(new Date().getTime()) + (remainingTime.value || Number(prodata.leftTime))))
      }
      if (state.value === 'paused') {
        actualEndTime.value = new Date().getTime() + remainingTime.value
      }
      state.value = 'process'
      useDoCountdown()
    }

    function useStopCountdown () {
      // const vm = this
      if (state.value !== 'process') {
        return
      }
      clearTimeout(countdownTimer.value)
      context.emit('stop', context)
      state.value = 'stopped'
    }
    function usePauseCountdown () {
      // const vm = this
      if (state.value !== 'process') {
        return
      }
      clearTimeout(countdownTimer.value)
      remainingTime.value = actualEndTime.value - new Date().getTime()
      context.emit('paused', context)
      state.value = 'paused'
    }

    function useSwitchCountdown () {
      // const vm = this
      if (state.value === 'stopped' || state.value === 'beforeStart') {
        return useStartCountdown(false)
      }
      if (state.value === 'process') {
        return useStopCountdown()
      }
    }

    function useFinishCountdown () {
      // const vm = this
      state.value = 'finished'
      timeObj.value = { org: { d: '', h: '', m: '', s: '', ms: 0 }, ceil: { d: 0, h: 0, m: 0, s: 0 } }
      usedTime.value = new Date().getTime() - actualStartTime.value
      context.emit('finish', context)
    }
    function useDoCountdown () {
      // const vm = this
      if (state.value !== 'process') {
        return
      }
      if (!actualStartTime.value) {
        actualStartTime.value = new Date().getTime()
      }
      const leftTime = new Date(actualEndTime.value).getTime() - new Date().getTime()
      if (leftTime > 0) {
        const t = { endTime: 0, speed: 0, leftTime: 0 }
        const leftSeconds = (leftTime) / 1000
        const org = {
          d: `${leftSeconds / 60 / 60 / 24}`,
          h: `${(leftSeconds / 60 / 60) % 24}`,
          m: `${(leftSeconds / 60) % 60}`,
          s: `${leftSeconds % 60}`,
          ms: leftTime % 1000
        }
        const txt = {
          d: parseInt(org.d, 10).toString(),
          h: parseInt(org.h, 10)
            .toString().padStart(2, '0'),
          m: parseInt(org.m, 10)
            .toString()
            .padStart(2, '0'),
          s: parseInt(org.s, 10)
            .toString()
            .padStart(2, '0'),
          ms: org.ms.toString().padStart(3, '0')
        }
        const ceil = {
          d: parseInt(`${Math.ceil(leftSeconds / 60 / 60 / 24)}`, 10),
          h: parseInt(`${Math.ceil(leftSeconds / 60 / 60)}`, 10),
          m: parseInt(`${Math.ceil(leftSeconds / 60)}`, 10),
          s: parseInt(`${Math.ceil(leftSeconds)}`, 10)
        }
        t.endTime = actualEndTime.value
        t.speed = Number(prodata.speed)
        usedTime.value = new Date().getTime() - actualStartTime.value
        t.leftTime = leftTime
        remainingTime.value = leftTime
        timeObj.value = Object.assign({}, t, txt, {
          org,
          ceil
        })
        timeObj.value.org = org
        timeObj.value.ceil = ceil
        context.emit('process', context)
      } else {
        useFinishCountdown()
        return
      }
      let nextSpeed =
        Number(prodata.speed) +
        (Number(actualStartTime.value) + runTimes.value++ * Number(prodata.speed) - Number(new Date().getTime()))
      if (nextSpeed < 0) {
        nextSpeed = Number(nextSpeed) + Number(prodata.speed)
      }

      useTimeDown(nextSpeed)
    }
    function useTimeDown (time:number) {
      const n: number = window.setTimeout(() => {
        useDoCountdown()
      }, time)
      countdownTimer.value = n || 0
    }
    function useStart () {
      const startTimex:string| number | Date = <string| number | Date> (prodata.startTime && new Date(Number(prodata.startTime)).getTime()) || 0
      const firstTime:number = <number> (startTimex && Number(startTimex) - new Date().getTime()) || 0
      if (prodata.autoStart) {
        state.value = 'preheat'
        setTimeout(() => {
          useStartCountdown(true)
        }, firstTime)
      }
    }

    useStart()
    watch(prodata.speed, async (curSpeed:number, oldSpeed:number) => {
      if (curSpeed < 0) {
        curSpeed = 0
      }
      if (curSpeed !== oldSpeed) {
        clearTimeout(countdownTimer.value)
        const now = new Date().getTime()
        const runTimesx = Math.floor((now - actualStartTime.value) / curSpeed)
        const nextTime = now % curSpeed
        runTimes.value = runTimesx
        await nextTick(() => {
          useTimeDown(nextTime)
          // const n: string | number = window.setTimeout(useDoCountdown, nextTime)
          // countdownTimer.value = n || 0
          // countdownTimer.value = setTimeout(useDoCountdown, nextTime)
        })
      }
    })
    return {
      state, // beforeStart, stopped, process, finished
      attrs,
      actualStartTime,
      actualEndTime,
      timeObj,
      countdownTimer,
      runTimes,
      usedTime,
      remainingTime,
      usePauseCountdown,
      useSwitchCountdown
    }
  }
})
</script>
