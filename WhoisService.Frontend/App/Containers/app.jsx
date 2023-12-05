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
        var domen = event.target[0].value;
        var listDomen = domen.split('.');

        if (!domen){
            alert("Вы ввели пустую строчку!")
            return;
        }
        
        if (listDomen.length == 1){
            alert("Вы не ввели адрес!");
            return;
        }
        
        if (domen.indexOf(' ') > -1){
            alert("В домене присутвуют пробелы!")
            return;
        }
        
        
        if (listDomen.length > 127){
            alert("У вас больше 127 поддоменов!")
            return;
        }
        
        if (domen.length > 255){
            alert('У вас больше 255 символов в домене!')
            return;
        }
        
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

        fetch('/api/whois/getwhois/' + domen)
            .then((response) => response.json())
            .then((result) => {
                var x = document.getElementById('whoisInfo')
                x.innerText  = result;
            });
        
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} className="md-form" >
                <div className="container-sm">
                    <div className="row">
                        <div className="col">
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
