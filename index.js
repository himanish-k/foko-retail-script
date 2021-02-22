console.time("script");

// const { EOL } = require("os");
const fs = require("fs");
const readline = require("readline");
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

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

main();

async function main() {
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
            columns = columns.map(col => col.trim());
            const [employeeId, firstName, lastName, phone, email] = columns;
            let validated = true;
            
            if (!employeeIdRegex.test(employeeId)) {
                console.log(dataFormatErrStr(inputFileName, lineCount, "Employee ID"));
                validated = false;
            }
            if (!plainStrRegex.test(firstName)) {
                console.log(dataFormatErrStr(inputFileName, lineCount, "First Name"));
                validated = false;
            }
            if (!plainStrRegex.test(lastName)) {
                console.log(dataFormatErrStr(inputFileName, lineCount, "Last Name"));
                validated = false;
            }
            if (!phoneRegex.test(phone)) {
                console.log(dataFormatErrStr(inputFileName, lineCount, "Phone No."));
                validated = false;
            }
            if (!emailRegex.test(email)) {
                console.log(dataFormatErrStr(inputFileName, lineCount, "Email"));
                validated = false;
            }

            if (validated)
                validatedData.push({ employeeId, firstName, lastName, phone, email })
        }
    });

    readInterface.on('close', async () => {
        try {
            await mongoose.connect(
                'mongodb://localhost:27017/foko_retail_db',
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                    useFindAndModify: false,
                }
            );
            console.log("Database connection established.");

            mongoose.connection.on("error", (err) => `Mongoose connection error: ${err}`);

            for (let data of validatedData) {

                try {    
                    const savedEmployee = await new Employee(data).save();
                    console.log("Data saved: ", savedEmployee.employeeId);
                } catch (err) {
                    const errType = typeof err;
                    console.log("Data not saved.");
                    if (errType === "object" &&
                        err.hasOwnProperty("name") &&
                        err.name === "MongoError" &&
                        err.hasOwnProperty("code") &&
                        err.code === 11000) {
                        
                        const { employeeId, firstName, lastName, phone, email } = data;
                        console.log("Retrying ...");
                        await Employee.findOneAndUpdate({ employeeId }, { firstName, lastName, phone, email });
                        console.log("Data updated: ", employeeId);
                    } else {
                        console.log("Error value type: ", errType);
                        if (errType === "object") {
                            console.log(Object.keys(err));
                            console.log(Object.values(err));
                        } else {
                            console.log(err);
                        }
                    }
                }
            }

            await mongoose.connection.close();
            console.log("Database connection closed.");
        } catch (err) {
            console.log("Could not connect to database.");
            return;
        }

        console.timeEnd("script");
    });
}

function dataFormatErrStr(inputFileName, lineCount, fieldName) {
    return `File: ${inputFileName} Line: ${lineCount} "${fieldName}" not formatted correctly or may contain invalid characters.`
}