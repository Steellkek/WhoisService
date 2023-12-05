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
        var x = event.target.value;
        var domen = x;
        fetch('/api/whois/getwhois/' + domen)
            .then((response) => response.json())
            .then((result) => {
                var x = document.getElementById('whoisInfo')
                x.innerText  = result;
            });
        
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
                <hr></hr>
                <p id="whoisInfo">Привет</p>
            </form>
        );
    }
}
