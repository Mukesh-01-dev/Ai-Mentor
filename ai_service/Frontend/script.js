document.getElementById("generateBtn").addEventListener("click", () => {

    const video = document.getElementById("lessonVideo");
    const celebrity = document.getElementById("celebrity").value;

    const data = fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course: "Java Script",
            topic: "Introduction to Java Script",
            celebrity: celebrity
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            alert("Lesson generation started. Check backend outputs folder.");
        });


});
