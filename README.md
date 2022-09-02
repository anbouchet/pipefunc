# pipefunc

## Installation
```sh
npm install pipefunc
```

## What is `pipefunc` ?
pipefunc is a typescript library providing functional pipelines and single-use pipes to combine and compose functions useable within typescript or javascript projects, with ensured
type-safety for *any* number of functions.

## Usage

```ts
import { pipeline, reversePipeline, pipe } from 'pipefunc';


const toNumber = (x: string) => +x
const toString = (x: {toString(): string}) => x.toString()
const repeat = (count: number) => <T>(el: T) => Array<T>(count).fill(el)
const joinStringArray = (x: string[]) => x.join('')
const toLower = (x: string) => x.toLowerCase()
const upperFirst = (x: string) => x.charAt(0).toUpperCase() + x.substring(1)

// Creating the pipeline, from first function applied
// (can have multiple arguments) to last.
const process = pipeline
  (toNumber)
  (toString)
  (repeat(15))
  (joinStringArray)
  (toLower)
  (upperFirst)
  ()

console.log(process('wat') + ' Batman!')

// Defining the equivalent pipeline using reversePipeline
// (functions can be specified in reverse order, may be useful to make more
// readable code in some cases)
const processBis = reversePipeline
  (upperFirst)
  (toLower)
  (joinStringArray)
  (repeat(15))
  (toString)
  (toNumber)
  // Providing this tuple to the build call allows you to change the name
  // and types of your pipeline parameters.
  // By default it keeps the first function's parameter list
  <[input: string]>()

console.log(processBis('wat') + ' Batman!')

// Alternatively, using the pipe function will allow you to easily
// compose functions for a one-time use. As opposed to pipelines,
// functions composed using the pipe function are applied
// *immediately*
const result = pipe('wat')
  (toNumber)
  (toString)
  (repeat(15))
  (joinStringArray)
  (toLower)
  (upperFirst)
  ()

console.log(`${result} Batman!`)
```

## Note on `this`
if the value of `this` matters in one of your functions, you will
have to wrap it to ensure the value of `this` is the expected one.

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

## Additional notes
Batman joke comes for the [wat presentation by Gary Bernhardt](https://www.destroyallsoftware.com/talks/wat), it's hilarious, highly recommend watching it.

This package is considered finished and feature-complete.
