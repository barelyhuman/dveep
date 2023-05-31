// @island

import { useEffect } from 'preact/hooks'
import { signal, computed } from '@preact/signals'

const dictionary = [
  'make',
  'it',
  'rain',
  'everyday',
  'the',
  'big',
  'brown',
  'wolf',
  'jumped',
  'over',
  'some',
  'more',
  'random',
  'words',
  'forsaken',
  'start',
  'world',
  'the',
  'dog',
]

const randomWords = num => {
  const min = 0
  const max = dictionary.length - 1
  const words = []
  for (let i = 0; i < num; i++) {
    const index = Math.floor(Math.random() * (max - min) + min)
    words.push(dictionary[index])
  }
  return words
}

const typed = signal('')
const words = signal([])

const markedWords = computed(() => {
  const typedSplit = typed.value.split(' ')
  const marked = words.value.map((x, i) => ({
    c: x,
    done: x === typedSplit[i],
  }))
  return marked
})

export default function Typer({ wordCount }) {
  useEffect(() => {
    if (words.value.length == 0) {
      words.value = randomWords(wordCount)
    }
  }, [])
  return (
    <>
      <textarea
        value={typed}
        onKeyup={e => (typed.value = e.target.value)}
      ></textarea>
      <div>
        {markedWords.value.map(x => (
          <span style={{ color: x.done ? 'green' : 'black' }}>{x.c + ' '}</span>
        ))}
      </div>
    </>
  )
}
