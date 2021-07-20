export default class SocketService {
    ws: WebSocket | undefined;
    static instance: SocketService;
    sendReTryCount = 0;
    connectReTryCount = 0;
    callBackMapping: any = {

    };
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService();
        }
        return this.instance;
    }

    connect() {
        if (!window.WebSocket) {
            console.log('您的浏览器不支持WebSocket');
            return;
        }
        this.ws = new WebSocket('ws://localhost:9998');
        //监听服务器返回的信息
        this.ws.onmessage = ({ data }) => {
            const recvData = JSON.parse(data);
            const socketType = recvData.socketType;

            if (this.callBackMapping[socketType]) {
                const action = recvData.action;
                if (action === 'getData') {
                    const realData = JSON.parse(recvData.data);
                    this.callBackMapping[socketType].call(this, realData);
                } else if (action === 'fullScreen') {
                    //调用注册好的方法
                    this.callBackMapping[socketType].call(this,recvData)
                } else if (action === 'themeChange') {
                    this.callBackMapping[socketType].call(this,recvData)
                }
            }
        }
        this.ws.onopen = () => {
            this.connectReTryCount = 0;
            console.log("连接服务器成功");
            
        }
        this.ws.onclose = () => {
            this.connectReTryCount++
            
            console.log("失去与服务器的连接");
            setTimeout(() => {
                this.connect();
            }, this.connectReTryCount * 500);
        }
    }
    registerCallBack(socketType: string, callBack: Function) {
        this.callBackMapping[socketType] = callBack
    }
    unRegisterCallBack(socketType: string) {
        this.callBackMapping[socketType] = null;
    }
    send(data: any) {
        if (this.ws?.readyState == this.ws?.OPEN) {
            this.sendReTryCount = 0;
            (this.ws as WebSocket).send(JSON.stringify(data));
        } else {
            this.sendReTryCount++;
            setTimeout(() => {
                this.send(data)
            }, this.sendReTryCount * 500);
        }
    }
}