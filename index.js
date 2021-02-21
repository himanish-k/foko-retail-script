// const { EOL } = require("os");
const fs = require("fs");
const readline = require("readline");

const argsErrorStr = "Error: Expecting argument(s) --input=<input-file> [--output=<output-file>]";
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
if (!fs.existsSync(inputFileName, )) {
    console.log(`File "${inputFileName}" does not exist`);
    return;
}

let readStream = fs.createReadStream(inputFileName);
readStream.on('error', err => console.log(`Unable to read from file "${inputFileName}"`, err));

let readInterface = readline.createInterface({
    input: readStream
});

// let ws = fs.createWriteStream("output.txt");
let lineCount = 0;
let validatedData = [];
readInterface.on('line', (line) => {
    // ws.write(line + EOL);
    ++lineCount;

    let columns = line.split(",");

    if (columns.length == 5) { // make sure there are at least 5 columns
        const [employeeId, firstName, lastName, phone, email] = columns;
        let validated = true;
        
        if (!employeeIdRegex.test(employeeId.trim())) {
            console.log(dataFormatErrStr(inputFileName, lineCount, "Employee ID"));
            validated = false;
        }
        if (!plainStrRegex.test(firstName.trim())) {
            console.log(dataFormatErrStr(inputFileName, lineCount, "First Name"));
            validated = false;
        }
        if (!plainStrRegex.test(lastName.trim())) {
            console.log(dataFormatErrStr(inputFileName, lineCount, "Last Name"));
            validated = false;
        }
        if (!phoneRegex.test(phone.trim())) {
            console.log(dataFormatErrStr(inputFileName, lineCount, "Phone No."));
            validated = false;
        }
        if (!emailRegex.test(email.trim())) {
            console.log(dataFormatErrStr(inputFileName, lineCount, "Email"));
            validated = false;
        }

        if (validated)
            validatedData.push({ employeeId, firstName, lastName, phone, email })
    }
});

readInterface.on('close', async () => {
    validatedData.forEach((emp) => console.log(emp));
});

function dataFormatErrStr(inputFileName, lineCount, fieldName) {
    return `File: ${inputFileName} Line: ${lineCount} "${fieldName}" not formatted correctly or may contain invalid characters.`
}