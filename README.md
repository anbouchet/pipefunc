# pipefunc

## Installation
```sh
npm install pipefunc
```

## What is `pipefunc` ?
pipefunc is a typescript library providing functional pipelines to combine functions useable within typescript or javascript projects, with ensured
type-safety for *any* number of functions.

## Usage

```ts
import { pipeline, reversePipeline } from 'pipefunc';


const toNumber = (x: string) => +x
const toString = (x: {toString(): string}) => x.toString()
const repeat = (count: number)=> <T>(el: T) => Array<T>(count).fill(el)
const joinStringArray = (x: string[]) => x.join('')
const toLower = (x: string) => x.toLowerCase()
const upperFirst = (x: string) => x.charAt(0).toUpperCase() + x.substring(1)

// creating the pipeline, from first function applied
// (can have multiple arguments) to last.
const process = pipeline
  (toNumber)
  (toString)
  (repeat(15))
  (joinStringArray)
  (toLower)
  (upperFirst)
  ()

console.log(process('wat') + ' Batman !')

// defining the equivalent pipeline using reversePipeline
// (functions can be specified in reverse order, may be useful to make more /
// readable code in some cases)
const processBis = reversePipeline
  (upperFirst)
  (toLower)
  (joinStringArray)
  (repeat(15))
  (toString)
  (toNumber)
  ()

console.log(processBis('wat') + ' Batman !')
```

## Note on `this`
if `this` matters in one of your functions, simply passing the reference
will not work, wrap you function beforehand to ensure the correct with is
used.

### Will not work
```ts
const obj = {
    value: 2,
    add(x) { this.value += x; return this }
}

pipeline(obj.add)
```
### Do instead
```ts
pipeline(x => obj.add(x))
```
or
```ts
pipeline(obj.add.bind(obj))
```
