console.log("Task 4 - Debugging");

// Set up the size of the page.
var length = 8;
var width = 10;

// calculate the area
var area = length * width;
console.log("area", area);
// calculate the perimeter
var perimeter = 2 * length + 2 * width;
console.log("perimeter", perimeter);

// Display the results
console.log("An area of a piece of paper with a length of " + length + ", and a width of " + width + " is " + area);
console.log("The same piece of paper has a perimeter of " + perimeter);

// Check, does this result look sensible
if (area > perimeter){
    console.log("Yay, your area is larger, this is right for this example");
}else{
    console.log("Hmm, your perimeter is larger. It shouldn't be for this example");
}
