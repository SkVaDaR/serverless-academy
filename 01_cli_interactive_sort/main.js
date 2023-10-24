const prompt = require('prompt-sync')();

function sortWords(words) {
    return words.sort();
}

function sortNumsAsc(numbers) {
    return numbers.sort((a, b) => a - b);
}

function sortNumsDesc(numbers) {
    return numbers.sort((a, b) => b - a);
}

function sortByLength(words) {
    return words.sort((a, b) => a.length - b.length);
}

function uniqueWords(words) {
    return [...new Set(words)];
}

function uniqueValues(values) {
    return [...new Set(values)];
}

while (true) {
    const input = prompt('Hello. Enter 10 words ot digits dividing them by spaces or type exit to quit: ')

    if (input.trim() === 'exit') {
        break;
    }

    const inputs = input.trim().split(' ');
    const words = inputs.filter((item) => isNaN(item));
    const numbers = inputs.filter((item) => !isNaN(item)).map(Number);

    const actions = prompt(
        'What operation would you like to perform?\n' +
        '1. Sort words alphabetically\n' +
        '2. Show numbers from lesser to greater\n' +
        '3. Show numbers from bigger to smaller\n' +
        '4. Display words in ascending order by number of letters in the word\n' +
        '5. Show only unique words\n' +
        '6. Display only unique values from the set of words and numbers entered by the user\n'
    );

    switch (actions.trim()) {
        case '1':
            console.log(sortWords(words));
            break;
        case '2':
            console.log(sortNumsAsc(numbers));
            break;
        case '3':
            console.log(sortNumsDesc(numbers));
            break;
        case '4':
            console.log(sortByLength(words));
            break;
        case '5':
            console.log(uniqueWords(words));
            break;
        case '6':
            console.log(uniqueValues([...words, ...numbers]));
            break;
        default:
            console.log('Wrong input');
    }

}