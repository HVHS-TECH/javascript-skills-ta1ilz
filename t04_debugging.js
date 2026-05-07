(function () {
    'use strict';
    try {
        console.group('Task 4 - Debugging');

        const paperLength = 8;
        const paperWidth = 10;

        const isPositiveNumber = (n) => typeof n === 'number' && isFinite(n) && n >= 0;
        if (!isPositiveNumber(paperLength) || !isPositiveNumber(paperWidth)) {
            console.error('Invalid dimensions provided:', { paperLength, paperWidth });
            console.groupEnd();
            return;
        }

        const area = paperLength * paperWidth;
        const perimeter = 2 * (paperLength + paperWidth);

        console.log('Dimensions:', { length: paperLength, width: paperWidth });
        console.log('Area:', area);
        console.log('Perimeter:', perimeter);

        console.log(
            `An area of a piece of paper with a length of ${paperLength}, and a width of ${paperWidth} is ${area}`
        );
        console.log(`The same piece of paper has a perimeter of ${perimeter}`);

        if (area > perimeter) {
            console.log('Yay, your area is larger — this is right for this example');
        } else {
            console.log("Hmm, your perimeter is larger. It shouldn't be for this example");
        }

        console.groupEnd();
    } catch (err) {
        console.error('Unexpected error in debugging script:', err);
    }
})();
