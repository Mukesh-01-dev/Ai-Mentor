
async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'password123'
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
        } else {
            console.log(data);
        }
    } catch (err) {
        console.error(err.message);
    }
}

testLogin();
