// name: Elston Tan Jia Liang
// Class: DAAA/1A/02    
// Adm : 2201915
var Input = require('readline-sync');

const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
var memberdb;
var membergroup;
var client;
async function startserver() {
    const uri = "mongodb+srv://<username>:<password>*@<secret>/?retryWrites=true&writeConcern=majority";
    client = new MongoClient(uri);
    //async function run() {
    //try {
    const database = client.db('Main');
    memberdb = database.collection('members');
    let memberlist = await memberdb.find({}).toArray();
    let members = [];
    for (var i = 0 ; i < memberlist.length; i++) {
        let args = [];
        for (key in memberlist[i]) {
            if (key=="_id") {continue;}
            args.push(memberlist[i][key]);
        }
        members.push(new Member(...args));
    }
    membergroup = new MemberGroup(...members);
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const pointTable = {
    50 : 10,
    100 : 50,
    200 : 100,
    500 : 200,
    1000 : 500,
    2500 : 1000
}
const memberTable = {
    500 : "Gold",
    5000 : "Platinum",
    20000 : "Diamond",
}

class Member {
    constructor(name, membershiptype, datejoined, birthdate, points) {
        this.name = name;
        this.mtype = membershiptype;
        this.date = datejoined;
        this.birth = birthdate;
        this.points = points;
    }
}

class MemberGroup {
    constructor(...members) {
        this.members = members;
    }

    async displayAll() {
        for (var i = 0; i < this.length; i++) {
            let member = this.members[i];
            console.log(`Name: ${member.name}`);
            console.log(`Membership Type: ${member.mtype}`);
            console.log(`Date joined: ${member.date}`);
            console.log(`Date of Birth: ${member.birth}`);
            console.log(`Points Earned: ${member.points}`);
            console.log("\n")
        }
    }

    async displayInfo(membername) {
        for (var i = 0; i < this.length; i++) {
            let member = this.members[i];
            if (member.name.toLowerCase() == membername.toLowerCase()) {
                console.log(`Name: ${member.name}`);
                console.log(`Membership Type: ${member.mtype}`);
                console.log(`Date joined: ${member.date}`);
                console.log(`Date of Birth: ${member.birth}`);
                console.log(`Points Earned: ${member.points}`);
                console.log("\n");
            }
        }
    }

    async checkname(name) {
        let flag = false;
        name = name.toLowerCase();
        for (var i = 0; i < this.length; i++) {
            let member = this.members[i];
            if (member.name.toLowerCase() == name) {
                flag = true;
                break;
            }
        }
        return flag;
    }
    
    get length() {
        return this.members.length;
    }

    async findmember(name) {
        let member;
        name = name.toLowerCase();
        for (var i = 0; i < this.members.length; i++) {
            member = this.members[i];
            if (member.name.toLowerCase() == name) {return member;}
        }
    }
    
    async removeMember(name) {
        let member;
        name = name.toLowerCase();
        for (var i = 0; i < this.members.length; i++) {
            member = this.members[i];
            if (member.name.toLowerCase() == name) {
                this.members.splice(i, 1);
            }
        }
    }
}
//initialization of arrays

/*
var leonardo = new Member("Leonardo", "Gold", "1 Dec 2019", "1 Jan 1980", 1400)
var catherine = new Member("Catherine", "Ruby", "14 Jan 2020", "28 Oct 1985", 250)
var luther = new Member("Luther", "Gold", "29 Apr 2020", "16 Mar 1992", 3350)
var bruce = new Member("Bruce", "Diamond", "3 Jun 2020", "18 Mar 1994", 40200)
var amy = new Member("Amy", "Ruby", "5 Jun 2020", "31 May 2000", 500)
var membergroup = new MemberGroup(leonardo, catherine, luther, bruce, amy);
*/

//initialization of variables
var flag = true;
var name;

var isAlpha = function(ch){
    return /^[A-Z]$/i.test(ch);
}

async function digitname(name) {
    let flag = false;
    for (var i = 0; i < name.length; i++) {
        if (!isAlpha(name[i])) {
            flag = true;
        }
    }
    return flag;
}

async function checkNum(num, range) {
    if (!parseInt(num)) {
        return 0;
    } else if (String(parseInt(num)) != num) {
        return 0;
    } else if (parseInt(num) > range || parseInt(num) < 1) {
        return 0;
    }
    return 1;
}

async function checkUpgrade(member) {
    let points = member.points;
    let pointstables = [20000, 5000, 500]
    for (var i = 0; i < 3; i++) {
        if (points >= pointstables[i]) {
            let newrank = memberTable[pointstables[i]];
            member.mtype = newrank;
            await memberdb.updateOne(
                {name: member.name},
                {$set: {mtype: newrank}}
            );
            break;
        }
    }
}

async function sortdate() { //dates will be an array of dates in string
    let dates = []
    for (var i = 0; i < membergroup.length; i++) {
        let member = membergroup.members[i];
        datetime = new Date(member.birth).getTime();
        dates.push([member, datetime]);
    }
    dates.sort(function(first, second) {
        return second[1] - first[1];
    });
    return dates;
}

async function hlPoints() {
    var highest = 0;
    var lowest = Infinity;
    var highestl = [];
    var lowestl = [];
    for (var i = 0; i < membergroup.length; i++) {
        let member = membergroup.members[i];
        if (member.points == highest) {
            highestl.push(member.name);
        } else if (member.points > highest) {
            highestl = [member.name];
            highest = member.points;
        }
        if (member.points == lowest) {
            lowestl.push(member.name);
        } else if (member.points < lowest) {
            lowestl = [member.name];
            lowest = member.points;
        }
    }
    return [lowestl, highestl];
}

async function submenu() {
    console.log("\nPlease select an option from the sub-menu:");
    console.log("1. Display names of (all) a certain type of members only.");
    console.log("2. Display the name of the youngest and oldest member in the system");
    console.log("3. Display the name of members with the highest and lowest points earned.");
    console.log("4. Display total number of members in each membership type.");
    console.log("5. Display the total points in each membership type.");
    console.log("6. Return to main-menu");
    inp = Input.question(">> ");
    while (!checkNum(inp, 6)) {
        console.log("Invalid input! Please enter a valid response!\n");
        inp = Input.question(">> ")
    }
    if (inp == "6") {
        return 6;
    } else if (inp == "2") {
        let age = await sortdate();
        console.log(`Youngest member: ${age[0][0].name}`);
        console.log(`Oldest member: ${age[age.length-1][0].name}`);
    } else if (inp == "3") {
        let hl = await hlPoints();
        let highestl = hl[1];
        let lowestl = hl[0];
        console.log(`Highest member: ${highestl.join(" and ")}`);
        console.log(`Lowest member: ${lowestl.join(" and ")}`);
    } else if (inp == "4") {
        let mtypes = {
            "ruby" : 0,
            "gold" : 0,
            "platinum" : 0,
            "diamond" : 0
        };
        for (var i = 0; i < membergroup.length; i++) {
            let member = membergroup.members[i];
            mtypes[member.mtype.toLowerCase()] += 1;
        }
        for (rank in mtypes) {
            console.log(`${rank}: ${mtypes[rank]}`);
        }
    } else if (inp == "5") {
        let mtypes = {
            "ruby" : 0,
            "gold" : 0,
            "platinum" : 0,
            "diamond" : 0
        };
        for (var i = 0; i < membergroup.length; i++) {
            let member = membergroup.members[i];
            mtypes[member.mtype.toLowerCase()] += member.points;
        }
        for (rank in mtypes) {
            console.log(`${rank}: ${mtypes[rank]}`);
        }
    } else if (inp == "1") {
        let membership = Input.question("Enter Membership Type: ");
        membership = membership.toLowerCase();
        while (!(["ruby", "gold", "platinum", "diamond"].includes(membership))) {// make it not case sensitive for ease
            console.log("Please enter a valid membership type.\n");
            membership = Input.question("Enter Membership Type: ");
            membership = membership.toLowerCase();
        }
        let result = [];
        for (var i = 0; i < membergroup.length; i++) {
            let member = membergroup.members[i];
            if (member.mtype.toLowerCase() == membership) {
                result.push(member.name);
            }
        }
        console.log(`Member(s) of membership type ${membership}: ${result.join(", ")}`);
    }
}

//main code 
async function main() {
    flag = true;
    console.log("Welcome to XYZ Membership Loyalty Programme!");
    name = Input.question("Please enter your name: ");
    console.log("\n")
    while (flag) { //while loop until 4 is inputted
        await prompt(); //asks for the user input
    }
}

async function prompt() {
    console.log(`Hi ${name}, please select your choice:\n\
    \t1. Display all members' information\n\
    \t2. Display member information\n\
    \t3. Add new member\n\
    \t4. Remove member\n\
    \t5. Update points earned\n\
    \t6. Statistics\n\
    \t7. Exit`);
    let select = Input.question("\t>> ");
    if (select == "1") {
        console.log("\n");
        await membergroup.displayAll();
    } else if (select == "2") {
        let name = Input.question("Please enter member's name: ");
        if (!await membergroup.checkname(name)) {
            console.log("Member does not exist.\n")
        } else {
            console.log("\n");
            await membergroup.displayInfo(name);
        }
    } else if (select == "3") {
        let name = Input.question("Please enter member's name: ");
        while (await membergroup.checkname(name) || await digitname(name)) {
            await membergroup.checkname(name) ? console.log("Member's name exists in database. Please enter a new name.\n") : console.log("Invalid name!\n");
            name = Input.question("Please enter member's name: ");
        }
        let dbirth = Input.question("Please enter member's date of birth: ");
        while (String(new Date(dbirth)) == "Invalid Date" || new Date(dbirth).getTime() >= new Date().getTime()) {
            console.log("Invalid date entered!\n");
            dbirth = Input.question("Please enter member's date of birth: ");
        }
        let curdate = new Date();
        curdate = `${curdate.getDate()} ${monthNames[curdate.getMonth()+1]} ${curdate.getFullYear()}`;
        newMember = new Member(name, "Ruby", curdate, dbirth, 0);
        await memberdb.insertOne({name : name, mtype: "Ruby", date: curdate, brth: dbirth, points: 0});
        membergroup.members.push(newMember);

        let refname = Input.question("Please enter referrer's name (Press enter to skip)\n>> ");
    
        while (!(await membergroup.checkname(refname)) && refname != "") {
            console.log("Name not found in database!");
            refname = Input.question("Please enter referrer's name (Press enter to skip)\n>> ");
        }         
        if (refname != "") {
            let referrer = await membergroup.findmember(refname);
            referrer.points += 100;
            await memberdb.updateOne(
                {name: referrer.name},
                {$set: {points: referrer.points}}
            );
            await checkUpgrade(referrer);
        }
    } else if (select == "4") {
        let name = Input.question("Enter the name of the member you want to remove (Press enter to cancel)\n>> ");
        while (!(await membergroup.checkname(name)) && name != "") {
            console.log("Name not found in database!");
            let name = Input.question("Enter the name of the member you want to remove (Press enter to cancel)\n>> ");
        }
        membergroup.removeMember(name);
        await memberdb.deleteOne(
            {name: RegExp(`^${name}$`, 'i')}
        );
    } else if (select == "5") {
        let name = Input.question("Please enter member's name: ");
        while (!await membergroup.checkname(name) || await digitname(name)) {
            !await membergroup.checkname(name) ? console.log("Member does not exist.\n") : console.log("Invalid name!\n");
            name = Input.question("Please enter member's name: ");
        }
        let amount = Input.questionInt("Please enter amount spent: ");
        let flag = false;
        var pointearned;
        for (var money in pointTable) {
            if ((amount-money) <= 0) {
                pointearned = pointTable[money];
                flag = true;
                break;
            }
        }
        if (!flag) {
            pointearned = 2000;
        }
        name = name.toLowerCase();
        for (var i = 0; i < membergroup.members.length; i++) {
            let member = membergroup.members[i];
            if (member.name.toLowerCase() == name) {
                member.points += pointearned;
                await memberdb.updateOne(
                    {name: member.name},
                    {$set: {points: member.points}}
                );
                await checkUpgrade(member);
                break;
            }
        }
        
    } else if (select == "6") {
        while (true) {
            out = await submenu();
            if (out == 6) {
                break;
            }
        }
    } else if (select == "7") {
        console.log("Thank you & goodbye!");
        flag = false; //set flag to false to break the while loop
    } else { // validation 
        // only runs when the input is not 1, 2, 3 or 4
        console.log("Please enter a valid input.\n\n");
    }
}


async function process() {
    await startserver();
    await main();
    client.close();
}
process();
