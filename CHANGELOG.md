# 1.2.0

- Started changelog
- Refactored internals of `pipeline` and `reversePipeline` functions to use arrays
  and reduce instead of many closures and recursion to execute the pipeline.
- Updated dev dependencies to fix vulnerabilities.

The new internals use an array and a call to reduce to call each function in a
pipeline in order, instead of recursion. To achieve this, the new internals also
consider strip the details of th functions' argument and return types internally,
assuming the initial repeated calls of the pipeline builder types handle the type
checks. This means two things:
1. A potential positive impact on performance
2. The removal of the need for @ts-ignore annotations.
