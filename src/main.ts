/** A function which takes only one argument */
type UnaryOperator<I extends [x: unknown] = [x: unknown], R = unknown> = (...x: I) => R;
/** A function that can take multiple arguments */
type MultiFunction<I extends [...x: unknown[]], R = unknown> = (...x: I) => R;

/** A type to wrap any function, for internal use only after adequate type checks */
type AnyFunction = (...a: unknown[]) => unknown;

/**
 * Builds the pipeline by allowing to add functions to be executed after others in the
 * pipeline
 */
export interface PipelineBuilder<P extends unknown[], R> {
  /**
   * Builds the pipeline
   * @returns the built pipeline as a function
   */
  <U extends P = [...x: P]>(): (...x: U) => R;
  /**
   * Adds {@link x} to the pipeline, {@link x} will be executed after all other
   * functions in the pipeline.
   * @param x The function to add to the pipeline
   * @returns A new builder
   */
  <U>(x: UnaryOperator<[R], U>): PipelineBuilder<P, U>;
}

/**
 * Starts the creation of a new processing pipeline. Operations happen in the order
 * that the functions are passed in.
 * @example
 * ```ts
 * // value in t is a function that executes fun1, then fun2 and returns it's return value
 * const t = pipeline(fun1)(fun2)()
 * ```
 * @param func The first function in the pipeline
 * @returns A new pipeline builder
 */
export function pipeline<P extends unknown[], R>(func: MultiFunction<P, R>): PipelineBuilder<P, R> {
  return pipelineBuilder<P, R>(func as AnyFunction);
}

/**
 * Create an executor function, which when called with the right arguments, calls
 * each function of the pipe in order, piping through the results
 * @param pipeline The array of functions to execute in order
 * @returns A function that executes and pipes through the results
 */
const makeExec =
  <P extends unknown[], R>(pipeline: AnyFunction[]) =>
  (...args: P) =>
    pipeline.reduce((args, func) => [func(...args)], args as unknown[])[0] as R;

/**
 * Creates the builder function, which memorizes the current pipeline.
 * @param func The next function to add to the pipeline array
 * @param previous The previous pipeline array, defaults to an empty array
 * @returns A function which decides whether to continue to create a pipeline or return an execution function based on its arguments
 */
function pipelineBuilder<P extends unknown[], R>(func: AnyFunction, previous: AnyFunction[] = []): PipelineBuilder<P, R> {
  const pipeline = [...previous, func];

  return function <U>(func?: UnaryOperator<[R], U>) {
    if (func != null) {
      return pipelineBuilder<P, U>(func as AnyFunction, pipeline);
    }

    return makeExec<P, R>(pipeline);
  } as PipelineBuilder<P, R>;
}

/**
 * Builds the pipeline, but cannot add to it.
 */
export interface TerminalPipelineBuilder<P extends unknown[], R> {
  /**
   * Builds the pipeline
   * @returns the built pipeline as a function
   */
  <U extends P = [...x: P]>(): (...x: U) => R;
}

/**
 * Builds the pipeline by allowing to add functions to be executed before others in
 * the pipeline
 */
export interface ReversePipelineBuilder<P extends unknown[], R> {
  /**
   * Builds the pipeline
   * @returns the built pipeline as a function
   */
  <U extends P = [...x: P]>(): (...x: U) => R;
  /**
   * Adds {@link x} to the pipeline, {@link x} will be executed before all other functions in the pipeline.
   * @param x The function to add to the pipeline
   * @returns A new builder
   */
  <U extends [unknown]>(x: UnaryOperator<U, P[0]>): ReversePipelineBuilder<U, R>;
  /**
   * Adds {@link x} to the pipeline, {@link x} will be executed before all other functions in the pipeline.
   * No other function can be added after adding a function with more than 1 parameter.
   * @param x The function to add to the pipeline
   * @returns A new terminal builder
   */
  <U extends unknown[]>(x: MultiFunction<U, P[0]>): TerminalPipelineBuilder<U, R>;
}

/**
 * Starts the creation of a new processing pipeline. Operations happen in the reverse
 * order that the functions are passed in.
 * @example
 * ```ts
 * // value in t is a function that executes fun2, then fun1 and returns it's return value
 * const t = reversePipeline(fun1)(fun2)()
 * ```
 * @param func Last function to be executed in the pipeline
 * @returns A new pipeline builder function
 */
export function reversePipeline<P extends [unknown], R>(func: UnaryOperator<P, R>): ReversePipelineBuilder<P, R> {
  return reversePipelineBuilder<P, R>(func as AnyFunction);
}

function reversePipelineBuilder<P extends unknown[], R>(func: AnyFunction, next: AnyFunction[] = []): ReversePipelineBuilder<P, R> {
  const pipeline = [func, ...next];

  return function <U extends unknown[]>(func?: MultiFunction<U, P[0]>) {
    if (func != null) {
      if (func.length > 1) {
        return () => makeExec<P, R>(pipeline);
      }
      return reversePipelineBuilder<P, U>(func as AnyFunction, pipeline);
    }

    return makeExec<P, R>(pipeline);
  } as ReversePipelineBuilder<P, R>;
}

/**
 * Wraps a value to be passed into functions
 */
export interface Pipe<T> {
  /**
   * Calls the given function with the wrapped value as parameter.
   *
   * @param func Function to apply to wrapped value
   * @returns A new Pipe with the function's return value
   */
  <U>(func: UnaryOperator<[T], U>): Pipe<U>;

  /**
   * Get the wrapped value
   *
   * @returns The currently wrapped value
   */
  (): T;
}

/**
 * Wraps a value inside of a new pipe, allowing to chain/compose functions easily
 *
 * @example
 * ```ts
 * // result contains the value of fun2(fun1(42))
 * const result = pipe(42)(fun1)(fun2)();
 * ```
 *
 * @param value The value to wrap
 * @returns A new pipe
 */
export function pipe<T>(value: T): Pipe<T> {
  return function <U>(func?: UnaryOperator<[T], U>) {
    if (func == null) {
      return value;
    }
    return pipe(func(value));
  } as Pipe<T>;
}
