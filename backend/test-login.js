import axios from 'axios';

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@test.com',
            password: 'password123'
        });
        console.log(res.data);
    } catch (err) {
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

testLogin();
