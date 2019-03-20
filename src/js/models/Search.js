//Key 9dc876f16571f396ea5d33e7e2758946
//https://www.food2fork.com/api/search

import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults(query) {
        const proxy = 'https://cors-anywhere.herokuapp.com/'
        const key = '9dc876f16571f396ea5d33e7e2758946';
    
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch(error) {
            alert(error);
        }
        
    }
}