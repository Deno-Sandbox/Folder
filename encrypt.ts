//change this to your file !
let file = "./exemples/hello.ts"
const ascii = JSON.parse(Deno.readTextFileSync("./ascii.json"))
const table = JSON.parse(Deno.readTextFileSync("./table.json"))
let rapport = []
let usedToken = []
let dirContent = [
    {
        path: "./tmp/",
        content: 0
    }
]

await execute("rm -rf "+dirContent[0].path)
await execute("mkdir "+dirContent[0].path)

let fileContent = Deno.readTextFileSync(file)
let arrayFile = fileContent.split("\n")


//now we have all the file
let lineToken = generateToken()
let nextToken = generateToken()
for(let i=0; i<arrayFile.length; i++){
    //here we need to convert line by line
    let line = arrayFile[i]
    let outBase = selectAEmptyDir().path
    console.log(outBase)
    createLine(line, lineToken, i, 0, outBase, nextToken)
    setDirNotEmpty(outBase)

    rapport.push({
        line: i+1,
        token: lineToken,
        dirLocation: outBase,
        nextToken: nextToken
    })

    lineToken = nextToken
    nextToken = generateToken()
}


console.log(rapport)



function createLine(line, lineToken, i, j, outBase, nextToken){

    let filePath = ""
    let newLine = ""

    //check all common words with the table and replace them
    let check = table.find(element => line.startsWith(element.name))
    if(check){
        filePath = `${outBase}${check.type}_${check.value}-${j}-${lineToken}`
        newLine = line.replace(check.name, ``)
    } else {
        //get the first char
        let asciiChar = getAsciiCode(line.charAt(0))
        // code _ value - rank - token
        filePath = `${outBase}ch_${asciiChar.code}-${j}-${lineToken}`
        newLine = line.replace(line.charAt(0), ``)
    }

    createDir(filePath)
    dirContent.push({
        path: filePath+"/",
        content: 0
    })

    if(newLine != ""){
        createLine(newLine, lineToken, i, j+1, outBase, nextToken)
    } else {
        //create the link file: 
        let link = `${outBase}l_${nextToken}-${j+1}-${lineToken}`
        createDir(link)
    }
}


function selectAEmptyDir(){
    let tmp = dirContent.filter(element => element.content == 0)
    //get a random dir
    if(tmp.length > 0){
        let index = Math.floor(Math.random() * tmp.length)
        return tmp[index]
    } else {
        console.log('Error : no empty dir')
        Deno.exit(0)
    }
}

function setDirNotEmpty(dir){
    let index = dirContent.findIndex(element => element.path == dir)
    dirContent[index].content = 1
}

//functions stuff
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

function createDir(dir){
    Deno.mkdirSync(dir)
}

function randomChar(nb){
    let asc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let res = ""
    for(let i=0; i<nb; i++){
        res += asc[Math.floor(Math.random()*asc.length)]
    }
    return res
}

function generateToken(){
    let token = randomChar(4)
    while(usedToken.includes(token)){
        token = randomChar(4)
    }
    usedToken.push(token)
    return token
}

function getAsciiCode(char){
    return ascii.find(element => element.string == char)
}
