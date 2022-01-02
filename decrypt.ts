let base = "./tmp/"

let fileArch = await explore_dir(base)
const convertionTable = JSON.parse(await Deno.readTextFile("./table.json"))
const ascii = JSON.parse(await Deno.readTextFile("./ascii.json"))

let fileList = fileArch
let list = fileArch
let script = ``
let counter = 1

let baseToken = await getBaseToken()

while (list.length != 0) {
    //decode line by line
    let line = getLineContent(baseToken)
    script += line[0]+"\n"
    //remvoe first elem from list
    list = list.filter(element => !element.endsWith(baseToken+'/'))
    baseToken = line[1]
    console.log('Line : '+counter+" is created")
    counter++
}

Deno.writeTextFile("./script.ts", script)
launchScript()

function launchScript(){
    console.log('+----- Script is created -----\n')
    main()
    deleteFromFile()
}

async function main() {
    var comcmd = "deno run -A --unstable --no-check script.ts".split(' ')
    Deno.run({cmd: comcmd,stdout: "inherit", stderr: "inherit"});
}

async function deleteFromFile(){
    setTimeout(() => {
        execute("rm ./script.ts")
    } , 1000)
}



//function space
async function execute(commande: any) {
    var content = "";
    var comcmd = commande.split(' ')
    var p = Deno.run({cmd: comcmd,stdout: "piped", stderr: "piped"});
    var { code } = await p.status();
    if (code === 0) {
      var rawOutput = await p.output();
      content = new TextDecoder().decode(rawOutput);
    } else {
      var rawError = await p.stderrOutput();
      var errorString = new TextDecoder().decode(rawError);
      console.log('[Error] - '+errorString);
    }
    return content
}

async function explore_dir(files: string) {
    var dir0 = files
    var list_dir = []
    var unchecked = [dir0]
  
    while (unchecked.length != 0) {
      var list = await execute('ls -ap ' + unchecked[0])
      var dir = list.split('\n')
      dir = dir.slice(2, dir.length - 1)
      for (var i = 0; i < dir.length; i++) {
        if (dir[i].endsWith("/")) {
          list_dir.push(unchecked[0] + dir[i])
            unchecked.push(unchecked[0] + dir[i])
        }
      }
      unchecked = unchecked.slice(1, unchecked.length)
    }
    return list_dir
}

function getAllDirOfDir(dir){
    let count = dir.split("/").length
    return fileArch.filter(element => element.startsWith(dir) && element.split('/').length == count + 1 && element != dir)
}

function getAllDirByToken(token){
    let out = []
    for(let i=0; i<fileList.length; i++){
        if(fileList[i].endsWith("-"+token+"/")){
            out.push(fileList[i])
        }
    }
    return out
}

async function getBaseToken(){
    let data = await execute('ls -ap ' + base)
    let dir = data.split('\n')
    let out = dir[3]
    out = out.split('/')[0].split('-')[2]
    return out
}

// all interpret space
function getLineContent(token){
    let data = getAllDirByToken(token)
    let line = ""
    let lineContent = []
    let nextToken = ""
    for(let i=0; i<data.length; i++){
        //get last part
        let part = data[i].split('/')[data[i].split('/').length-2]
        //console.log(part)
        let arraytmp = part.split('-')
        let array = [arraytmp[0].split('_')[0], arraytmp[0].split('_')[1], arraytmp[1], arraytmp[2]]
        //console.log(array)
        if(checkArrayContent(array)){
            lineContent.push(array)
        }
    }
    //now we order the array
    lineContent = orderArrayForm(lineContent)
    //now we create the line

    for(let i=0; i<lineContent.length; i++){
        //translate from ascii or table
        if(lineContent[i][0] == 'ch'){
            let tmp = getStringChar(lineContent[i][1])
            line += tmp
        } else if(lineContent[i][0] == 'l'){
            nextToken = (lineContent[i][1].split('-')[lineContent[i][1].split('-').length-1]).replace('/', '')
        } else {
            //this is the table convertion
            line += getElemFromTable(lineContent[i][1], lineContent[i][0])
        }
    } 
    return [line, nextToken]
}


function getElemFromTable(value, type){
    let tmp = convertionTable.filter(element => element.value == value && element.type == type)
    return tmp[0].name
}

function getStringChar(charCode){
    let char = ascii.find(element => element.code == charCode)
    return char.string
}

function orderArrayForm(array){
    //order by the 3rd element
    let tmp = array.sort((a, b) => (Number(a[2]) > Number(b[2])) ? 1 : -1)
    return tmp
}

function checkArrayContent(array){
    for(let i=0; i<array.length; i++){
        if(array[i] == ""){
            return false
        }
    }
    return true
}

