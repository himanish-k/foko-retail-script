## Instructions

Note:
* Make sure you have Docker installed and running on your computer.
* Make sure you have Node.js, npm and git installed on your computer.

### Setup
* git clone the project repository
* cd into the project folder
* run docker-compose up
* run npm install
* run node input-txt-generator.js 20  
  (To create an input file with 20 rows of sample data)

### To run the script
* node index.js --input=input.txt  
  Or whatever else your input file is called

### To tear down setup
* cd into the project folder
* docker-compose down

## Approach
Script contains three functions that are called in succession.
* readAndValidateEmployeeData: Reads from the input file and validates each employee data entry;
it returns an array of only entries that were correctly formatted.
* persistData: Takes as argument an array containing employee data (ideally this data should be
validated) and saves/updates the data into the database.
* writeToFile: Takes as argument the name of the output file and an array containing employee
data (in our case this array only contains entries that were saved/updated into the database).

Used these Stackoverflow articles to solve certain problems.
* To receive the updated data in the event that an entry is updated instead of saved.
It is important to receive the updated data because it contains the update date that
may be required to write data to an output file.
https://stackoverflow.com/questions/32811510/mongoose-findoneandupdate-doesnt-return-updated-document
* To resolve errors that occured when the model schema from the Employee model was changed.
https://stackoverflow.com/questions/24430220/e11000-duplicate-key-error-index-in-mongodb-mongoose
* To confirm that the file input file exists before beginning reading from it.
https://stackoverflow.com/a/26250027/4946115 