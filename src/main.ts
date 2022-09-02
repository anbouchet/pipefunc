/** A function which takes only one argument */
type UnaryOperator<I extends [x: unknown] = [x: unknown], R = unknown> = (...x: I) => R;
/** A function that can take multiple arguments */
type MultiFunction<I extends [...x: unknown[]], R = unknown> = (...x: I) => R;

/**
 * Builds the pipeline by allowing to add functions to be executed after others in the pipeline
 */
export interface PipelineBuilder<P extends unknown[], R> {
  /**
   * Builds the pipeline
   * @returns the built pipeline as a function
   */
  <U extends P = [...x: P]>(): (...x: U) => R;
  /**
   * Adds {@link x} to the pipeline, {@link x} will be executed after all other functions in the pipeline.
   * @param x The function to add to the pipeline
   * @returns A new builder
   */
  <U>(x: UnaryOperator<[R], U>): PipelineBuilder<P, U>;
}

/**
 * Starts the creation of a new processing pipeline. Operations happen in the order that the functions are passed in.
 * @example
 * ```ts
 * // value in t is a function that executes fun1, then fun2 and returns it's return value
 * const t = pipeline(fun1)(fun2)()
 * ```
 * @param a The first function in the pipeline
 * @returns A new pipeline builder
 */
export function pipeline<P extends unknown[], R>(a: MultiFunction<P, R>): PipelineBuilder<P, R> {
  return function <U>(b?: UnaryOperator<[R], U>) {
    if (b == null) {
      return a;
    }

    return pipeline((...x: P) => b(a(...x)));
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
 * Builds the pipeline by allowing to add functions to be executed before others in the pipeline
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
 * Starts the creation of a new processing pipeline. Operations happen in the reverse order that the functions are passed in.
 * @example
 * ```ts
 * // value in t is a function that executes fun2, then fun1 and returns it's return value
 * const t = reversePipeline(fun1)(fun2)()
 * ```
 * @param a Last function to be executed in the pipeline
 * @returns A new pipeline builder function
 */
export function reversePipeline<P extends [unknown], R>(a: UnaryOperator<P, R>): ReversePipelineBuilder<P, R> {
  return function <U extends unknown[]>(b?: MultiFunction<U, P[0]>) {
    if (b == null) {
      return a;
    }

    if (b.length > 1) {
      return <V extends U>() =>
        (...x: V) =>
          // @ts-ignore return value of b is checked to be compatible with param type of a
          a(b(...x));
    }
    // @ts-ignore return value of b is checked to be compatible with param type of a
    return reversePipeline(((...x: U) => a(b(...x))) as unknown as UnaryOperator<[U[0]], R>);
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
