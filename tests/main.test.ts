import { pipe, pipeline, reversePipeline } from '../src/main';

const someNumber = () => 42;
const someNumberTimesFive = () => someNumber() * 5;

function getMocks(): [(x: string) => number, (x: number) => number] {
  const parseNum = jest.fn().mockReturnValue(someNumber());
  const timesFive = jest.fn().mockReturnValue(someNumberTimesFive());
  return [parseNum, timesFive];
}

const someString = () => '42';

describe('pipefunc tests', () => {
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
