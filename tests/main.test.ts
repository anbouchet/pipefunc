import { pipe, pipeline, reversePipeline } from '../src/main';

const someNumber = () => 42;
const someNumberTimesFive = () => someNumber() * 5;

function getMocks() {
  const parseNum: jest.Mock<number, [string]> = jest.fn().mockReturnValue(someNumber());
  const timesFive: jest.Mock<number, [number]> = jest.fn().mockReturnValue(someNumberTimesFive());
  return [parseNum, timesFive] as const;
}

const someString = () => '42';

describe('pipefunc tests', () => {
  describe('`pipeline` function tests', () => {
    test('Pipeline function with one function', () => {
      // Given
      const parseNum = getMocks()[0];

      // When
      const builder = pipeline(parseNum);

      // Then
      expect(builder).toBeInstanceOf(Function);
      expect(parseNum).toHaveBeenCalledTimes(0);
    });

    test('Building pipeline with one function', () => {
      // Given
      const parseNum = getMocks()[0];

      // When
      const func = pipeline(parseNum)();

      // Then
      expect(typeof func).toBe('function');
      expect(parseNum).toHaveBeenCalledTimes(0);
    });

    test('Built pipeline with one function processes input when called', () => {
      // Given
      const parseNum = getMocks()[0];
      const value = someString();

      // When
      const func = pipeline(parseNum)();
      const result = func(value);

      // Then
      expect(parseNum).toHaveBeenCalledTimes(1);
      expect(parseNum).toHaveBeenCalledWith(value);
      expect(result).toBe(someNumber());
    });

    test('Building pipeline with multiple functions', () => {
      // Given
      const [parseNum, timesFive] = getMocks();
      const value = someString();

      // When
      const func = pipeline(parseNum)(timesFive)();
      const result = func(value);

      // Then
      expect(result).toBe(someNumberTimesFive());
      expect(parseNum).toHaveBeenCalledTimes(1);
      expect(parseNum).toHaveBeenCalledWith(value);
      expect(timesFive).toHaveBeenCalledTimes(1);
      expect(timesFive).toHaveBeenCalledWith(someNumber());
      const firstCallOrder = parseNum.mock.invocationCallOrder[0];
      expect(timesFive.mock.invocationCallOrder[0]).toBe(firstCallOrder + 1);
    });
  });

  describe('`reversePipeline` function tests', () => {
    test('Reverse pipeline function with one function', () => {
      // Given
      const parseNum = getMocks()[0];

      // When
      const builder = reversePipeline(parseNum);

      // Then
      expect(builder).toBeInstanceOf(Function);
      expect(parseNum).toHaveBeenCalledTimes(0);
    });

    test('Building reverse pipeline with one function', () => {
      // Given
      const parseNum = getMocks()[0];

      // When
      const func = reversePipeline(parseNum)();

      // Then
      expect(typeof func).toBe('function');
      expect(parseNum).toHaveBeenCalledTimes(0);
    });

    test('Built reverse pipeline with one function processes input when called', () => {
      // Given
      const parseNum = getMocks()[0];
      const value = someString();

      // When
      const func = reversePipeline(parseNum)();
      const result = func(value);

      // Then
      expect(parseNum).toHaveBeenCalledTimes(1);
      expect(parseNum).toHaveBeenCalledWith(value);
      expect(result).toBe(someNumber());
    });

    test('Building pipeline with multiple functions', () => {
      // Given
      const [parseNum, timesFive] = getMocks();
      const value = someString();

      // When
      const func = reversePipeline(timesFive)(parseNum)();
      const result = func(value);

      // Then
      expect(result).toBe(someNumberTimesFive());
      expect(parseNum).toHaveBeenCalledTimes(1);
      expect(parseNum).toHaveBeenCalledWith(value);
      expect(timesFive).toHaveBeenCalledTimes(1);
      expect(timesFive).toHaveBeenCalledWith(someNumber());
      const firstCallOrder = parseNum.mock.invocationCallOrder[0];
      expect(timesFive.mock.invocationCallOrder[0]).toBe(firstCallOrder + 1);
    });
  });

  describe('`pipe` function tests', () => {
    test('Pipe function call returns a function', () => {
      //Given
      const inputValue = someString();
      //When
      const p = pipe(inputValue);
      // Then
      expect(p).toBeInstanceOf(Function);
    });

    test('Pipe call with no argument returns the contained value', () => {
      // Given
      const inputValue = someNumber();
      // When
      const val = pipe(inputValue)();
      // Then
      expect(val).toBe(inputValue);
    });

    test('Pipe calls given function', () => {
      // Given
      const parseNum = getMocks()[0];
      const inputValue = someString();
      // When
      pipe(inputValue)(parseNum);
      // Then
      expect(parseNum).toHaveBeenCalled();
      expect(parseNum).toHaveBeenCalledWith(inputValue);
    });

    test('Pipe calls functions in right order', () => {
      // Given
      const [parseNum, timesFive] = getMocks();
      const inputValue = someString();

      // When
      const p1 = pipe(inputValue)(parseNum);
      // Then
      expect(parseNum).toHaveBeenCalled();
      expect(parseNum).toHaveBeenCalledWith(inputValue);
      // When
      const p2 = p1(timesFive);

      // Then
      expect(timesFive).toHaveBeenCalled();
      expect(timesFive).toHaveBeenCalledWith(someNumber());

      // When
      const result = p2();

      // Then
      expect(result).toBe(someNumberTimesFive());
    });
  });
});
