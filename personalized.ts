import axios, { AxiosResponse } from "axios";

export class superActionLogger{
    addingArray: Array<Object>;
    req: personalizedCaller;
    acceptedGenerationArray: Array<Object>
    deletionArray: Array<Object>
    generationArray: Array<Object>
    constructor() {
        this.addingArray = [];
        this.acceptedGenerationArray = [];
        this.generationArray = [];
        this.deletionArray = [];
        this.req = new personalizedCaller;
    }
    // time is the current time, not the time it took, important to remember this
    addText(text: string, time: number, range: Object) {
        if(text.length > 1){
            this.acceptedGenerationArray.push({text:text, time:time, range:range}); // need to handle this differently maybe? might do it on server side
        }else {
            if(text == ""){ // for backspaces
                this.deletionArray.push({text:"<bkspc>", time:time, range:range});
            }else{
                this.addingArray.push({text: text, time: time, range:range});
            }
        }
    }

    addGeneratedText(text: string, time: number, range: Object, confidence: number) {
        this.generationArray.push({text: text, time: time, range:range, confidence: confidence})
    }

    printText() {
        console.log("sentence is", this.addingArray);
    }

    resetSentence() {
        this.addingArray = [];
    }

    sendTextAddToServer() {
        this.req.sendData(this.addingArray, "add");
    }

    sendAcceptedPredToServer() {
        this.req.sendData(this.acceptedGenerationArray, "acceptedPred");
    }

    sendDeleteToServer() {
        this.req.sendData(this.deletionArray, "backspace");
    }

    sendPredsToServer() {
        this.req.sendData(this.generationArray, "generations")
    }

    sendAllToServer() {
        this.sendTextAddToServer();
        this.sendAcceptedPredToServer();
        this.sendDeleteToServer();
    }
}

export class personalizedCaller {
    url: string;
    postUrl: string;
    getUrl: string;
    constructor(){
        this.url = "http://127.0.0.1:4000";
        this.postUrl = this.url + "/post";
        this.getUrl = this.url + "/get";
        axios.defaults.timeout = 5000;
    }

    async sendData(data: Array<Object>, actionType: string) {
        axios.post(this.postUrl + "/data", {
            actionType: actionType, 
            data: data
        }).then(response => {
            console.log('data posted successfully, response.data');
        }).catch(error => {
            console.error('error posting data', error);
        });
    }

    private async getThresholdFromPersonalized(): Promise<AxiosResponse | undefined> {
        try{
            let outPutData = await axios.get(this.getUrl)
            console.log(outPutData.data);
            return outPutData; // not sure this works how I think it will
        }catch(error) {
            console.error('error fetching data', error)
            return undefined;
        }
    }
    
    async getThreshold(): Promise<number | undefined> {
        let data = await this.getThresholdFromPersonalized()
        // TODO: get the threshold from thresholdData, not sure what it looks like yet
        return undefined;
    }
}