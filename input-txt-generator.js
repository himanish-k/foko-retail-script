console.time("script");
const fs = require("fs");
let count = 10;

if (process.argv.length > 2)
    count = Number(process.argv[2]);

const writeStream = fs.createWriteStream(__dirname + "/input.txt");
writeStream.write(`A${prependZeroes(1, 6)}, John, Doe, (100)100-1000, johndoe@johndoe.com`)
for (let i=2; i <= count; i++) {
    writeStream.write(`\nA${prependZeroes(i, 6)}, John, Doe, (100)100-1000, johndoe@johndoe.com`);
}

console.timeEnd("script");

function prependZeroes(num, requiredLength) {
    num = "" + num;
    let initNumLength = num.length;

    for(let i=0; i < requiredLength - initNumLength; i++)
        num = "0" + num;

    return num;
}