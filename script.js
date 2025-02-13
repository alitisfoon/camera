document.addEventListener('DOMContentLoaded', function () {
    // تنظیمات Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // شروع ویدیو
    function startVideo() {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(function (stream) {
                document.getElementById('video').srcObject = stream;
            })
            .catch(function (err) {
                console.error("Error accessing webcam: ", err);
            });
    }
    startVideo();

    // بارگذاری مدل‌ها
    function loadModels() {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ])
        .then(() => console.log('Models loaded successfully'))
        .catch(err => console.error('Error loading models: ', err));
    }
    loadModels();

    // ذخیره اطلاعات دانش‌آموز
    document.getElementById('studentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const score = parseInt(document.getElementById('score').value);
        const absences = parseInt(document.getElementById('absences').value);

        if (name && !isNaN(score) && !isNaN(absences)) {
            db.collection('students').add({ name, score, absences })
                .then(() => alert('اطلاعات ذخیره شد!'))
                .catch(err => alert('خطا در ذخیره اطلاعات'));
            document.getElementById('studentForm').reset(); // پاکسازی فرم
        } else {
            alert('لطفا تمام فیلدها را به درستی وارد کنید.');
        }
    });

    // بروزرسانی لیست دانش‌آموزان
    db.collection('students').onSnapshot(function (snapshot) {
        const list = document.getElementById('studentsList');
        list.innerHTML = '';
        snapshot.forEach(function (doc) {
            const student = doc.data();
            const li = document.createElement('li');
            li.innerText = `${student.name} - نمره: ${student.score} - غیبت: ${student.absences}`;
            if (student.absences > 3) {
                li.classList.add('red-border');
            } else if (student.score < 12) {
                li.classList.add('blue-border');
            } else if (student.score >= 18) {
                li.classList.add('green-border');
            }
            list.appendChild(li);
        });
    });
});
