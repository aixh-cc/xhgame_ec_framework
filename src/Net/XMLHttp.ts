import { IHttp } from "./Http";

export class XMLHttp implements IHttp {
    public get(url: string, reqData: any, headers: string[][] = [['Content-Type', 'application/x-www-form-urlencoded']]) {
        return new Promise((resolve, reject) => {
            url += "?";
            for (var item in reqData) {
                url += item + "=" + reqData[item] + "&";
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        var response = xhr.responseText;
                        if (response) {
                            var responseJson = JSON.parse(response);
                            resolve(responseJson);
                        } else {
                            reject('返回数据不存在');
                        }
                    } else {
                        reject('请求失败');
                    }
                }
            };
            xhr.open("GET", url, true);
            for (let i = 0; i < headers.length; i++) {
                const _header = headers[i];
                xhr.setRequestHeader(_header[0], _header[1]);
            }
            xhr.send();
        })
    }


    public post(url: string, reqData: any, headers: string[][] = [['Content-Type', 'application/x-www-form-urlencoded']]) {
        return new Promise((resolve, reject) => {
            //1.拼接请求参数
            var param = "";
            for (var item in reqData) {
                param += item + "=" + reqData[item] + "&";
            }
            //2.发起请求
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        var response = xhr.responseText;
                        if (response) {
                            var responseJson = JSON.parse(response);
                            resolve(responseJson);
                        } else {
                            reject('返回数据不存在');
                        }
                    } else {
                        reject('请求失败');
                    }
                }
            };
            xhr.open("POST", url, true);
            for (let i = 0; i < headers.length; i++) {
                const _header = headers[i];
                xhr.setRequestHeader(_header[0], _header[1]);
            }
            xhr.send(param);//reqData为字符串形式： "key=value"
        })
    }
}