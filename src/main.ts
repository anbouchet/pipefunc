/** A function which takes only one argument */
type UnaryOperator<I extends [x: unknown] = [x: unknown], R = unknown> = (...x: I) => R;
/** A function that can take multiple arguments */
type MultiFunction<I extends [...x: unknown[]], R = unknown> = (...x: I) => R;

/**
 * Builds the pipeline by allowing to add functions to be executed after others in the pipeline
 */
interface PipelineBuilder<P extends unknown[], R> {
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
interface TerminalPipelineBuilder<P extends unknown[], R> {
  /**
   * Builds the pipeline
   * @returns the built pipeline as a function
   */
  <U extends P = [...x: P]>(): (...x: U) => R;
}

/**
 * Builds the pipeline by allowing to add functions to be executed before others in the pipeline
 */
interface ReversePipelineBuilder<P extends unknown[], R> {
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
