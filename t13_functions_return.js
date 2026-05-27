<!DOCTYPE html>
<html>
<body>
<h1>JavaScript Functions</h1>
<h2>The return Statement</h2>
<p>A function that returns the greeting: "Hello World":</p>

<p id="demo"></p>

<script>
function sayHello() {
  return "Hello World";
}

let greeting = sayHello();

document.getElementById("demo").innerHTML = greeting;
</script>

</body>
</html>
