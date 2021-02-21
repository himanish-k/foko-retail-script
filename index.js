// const { EOL } = require("os");
const fs = require("fs");
const readline = require("readline");

const plainStrRegex = /^[A-Za-z]*$/;
const employeeIdRegex = /^[A-Za-z]{1}[\d]{6,}/;
const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

if (process.argv.length <= 2) {
    console.error(argsErrorStr);
    return;
}

let inputStr = process.argv[2].split("=");
if (inputStr.length != 2 || inputStr[0] != "--input") {
    console.error(argsErrorStr);
    return;
}

const inputFileName = inputStr[1];
let readStream;
try {    
    readStream = fs.createReadStream(inputFileName);
} catch (err) {
    console.log(err);
    return;
}
let readInterface = readline.createInterface({
    input: readStream
});

// let ws = fs.createWriteStream("output.txt");
let lineCount = 0;
readInterface.on('line', (line) => {
    // ws.write(line + EOL);
    ++lineCount;

    let columns = line.split(",");
    if (columns.length == 5) {
        const [employeeId, firstName, lastName, phone, email] = columns;
        
        if (!employeeIdRegex.test(employeeId.trim()))
            console.log(dataFormatErrStr(inputFileName, lineCount, "Employee ID"));
        if (!plainStrRegex.test(firstName.trim()))
            console.log(dataFormatErrStr(inputFileName, lineCount, "First Name"));
        if (!phoneRegex.test(phone.trim()))
            console.log(dataFormatErrStr(inputFileName, lineCount, "Phone No."));
        if (!emailRegex.test(email.trim()))
            console.log(dataFormatErrStr(inputFileName, lineCount, "Email"));
    }
});

function dataFormatErrStr(inputFileName, lineCount, fieldName) {
    return `File: ${inputFileName} Line: ${lineCount} "${fieldName}" not formatted correctly or may contain invalid characters.`
}