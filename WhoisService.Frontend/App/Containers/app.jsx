import React from "react";
import 'isomorphic-fetch'
export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        let whoisInfo = document.getElementById('whoisInfo')
        
        let domen = event.target[0].value;
        if (!domen){
            alert("Вы ввели пустую строчку!")
            return;
        }

        let listDomen = domen.split('.');
        
        let ipv46_regex = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm;
        let isIp = ipv46_regex.test(domen)
        
        if (listDomen.length == 1 && !isIp){
            alert("Вы не ввели домен!");
            return;
        }
        
        if (domen.indexOf(' ') > -1 && !isIp){
            alert("В домене присутвуют пробелы!")
            return;
        }
        
        
        if (listDomen.length > 127 && !isIp){
            alert("У вас больше 127 поддоменов!")
            return;
        }
        
        if (domen.length > 255 && !isIp){
            alert('У вас больше 255 символов в домене!')
            return;
        }
        
        if (!isIp){
            for ( var i = 0; i <listDomen.length; i++){
                if (listDomen[i]==""){
                    alert("Один из поддоменов пустой!");
                    return;
                }
                if (listDomen[i].length > 63){
                    alert("Поддомены содержат больше 63 символов!");
                    return;
                }
            }
        }

        whoisInfo.innerText = "Загрузка..."
        
        fetch('/api/whois/getwhois/' + domen)
            .then((response) => response.json())
            .then((result) => {
                whoisInfo.innerText  = result;
            });
        
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="md-form" >
                <div className="container-sm" >
                    <div className="row">
                        <div className="col-9">
                            <input type="text" id="form1" value={this.state.value} onChange={this.handleChange} maxLength={255} placeholder="Введите домен/ip-адрес" className="form-control"/>
                        </div>
                        <div className="col">
                            <input type="submit" value="Показать" className="btn btn-primary"/>
                        </div>
                    </div>
                </div>
                <hr></hr>
                <div className="container-sm" style={{backgroundColor: 'Silver'}} id="whoisInfo"></div>
            </form>
        );
    }
}
