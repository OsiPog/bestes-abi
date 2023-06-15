const SUBJECT_NAMES = {
    "DE": "Deutsch",
    "EN": "1. Fremdsprache",
    "FR": "2. Fremdsprache",
    "RU": "2. Fremdsprache",
    "LA": "2. Fremdsprache",
    "SPA": "3. Fremdsprache",
    "KU": "Kunst",
    "MU": "Musik",
    "GE": "Geschichte",
    "GRW": "G/R/W",
    "GEO": "Geographie",
    "MA": "Mathematik",
    "PH": "Physik",
    "CH": "Chemie",
    "BIO": "Biologie",
    "INF": "Informatik",
    "WBL": "Fächerverbindenden Grundkurs",
    "FVGK": "Fächerverbindenden Grundkurs",
    "SPO": "Sport",
    "REe": "Religion",
    "ETH": "Religion",
    "PHI": "Philosophie"
}
const CLICK_EVENT = new MouseEvent("click", {view: window, bubbles: true, cancelable: false})


// subject: {local_id, grades: []}
// div: DOM-Element
const editSubject = (div, subject) => {
    const select_subject = div.querySelector("select.select")
    select_subject.value = SUBJECT_NAMES[subject.local_id]

    const inputs_grade = div.querySelectorAll("input[type=number]")

    const updateInputs = (ignore_input=null) => {
        inputs_grade.forEach((input, i) => {
            if (ignore_input === input) return
            if (subject.grades[i]) input.value = subject.grades[i]
            if (ignore_input === null) { // first runtime
                input.addEventListener("change", ()=>updateInputs(input))
                input.addEventListener("click", ()=>updateInputs())
            }
        });
    }

    updateInputs()

}

const insertGrades = (averages, subjects) => {
    // All subject rows
    let divs_subject = document.querySelectorAll("fieldset[name=test]>div.mb-2")
    
    // if there are not enough subject rows add more with a virtual click on the button
    if (divs_subject.length < Object.keys(averages[0]).length) {
        const button = document.querySelector("button.btn.btn-primary.btn-sm.justify-self-start.mt-5")

        for (let i=0;i<Object.keys(averages[0]).length-divs_subject.length;i++) {
            button.dispatchEvent(CLICK_EVENT)
        }
        divs_subject = document.querySelectorAll("fieldset[name=test]>div.mb-2")
    }

    const ignore_subjects = []

    // set 1st advanced course
    editSubject(divs_subject[0], {local_id: subjects.lk1, grades: [
        averages[0][subjects.lk1],
        averages[1][subjects.lk1],
        averages[2][subjects.lk1],
        averages[3][subjects.lk1]
    ]})
    ignore_subjects.push(subjects.lk1)

    // set 2nd advanced course
    editSubject(divs_subject[1], {local_id: subjects.lk2, grades: [
        averages[0][subjects.lk2],
        averages[1][subjects.lk2],
        averages[2][subjects.lk2],
        averages[3][subjects.lk2]
    ]})
    ignore_subjects.push(subjects.lk2)

    // set 3rd exam
    editSubject(divs_subject[2], {local_id: subjects.p3, grades: [
        averages[0][subjects.p3],
        averages[1][subjects.p3],
        averages[2][subjects.p3],
        averages[3][subjects.p3]
    ]})
    ignore_subjects.push(subjects.p3)

    // set 4th exam
    editSubject(divs_subject[3], {local_id: subjects.p4, grades: [
        averages[0][subjects.p4],
        averages[1][subjects.p4],
        averages[2][subjects.p4],
        averages[3][subjects.p4]
    ]})
    ignore_subjects.push(subjects.p4)

    // set 5th exam
    editSubject(divs_subject[4], {local_id: subjects.p5, grades: [
        averages[0][subjects.p5],
        averages[1][subjects.p5],
        averages[2][subjects.p5],
        averages[3][subjects.p5]
    ]})
    ignore_subjects.push(subjects.p5)

    const rest_subjects = []

    for (const local_id in averages[0]) {
        if (!ignore_subjects.includes(local_id))
            rest_subjects.push(local_id)
    }

    setTimeout(() => {
        rest_subjects.forEach((local_id, i) => {
            editSubject(divs_subject[i+5], {local_id, grades: [
                averages[0][local_id],
                averages[1][local_id],
                averages[2][local_id],
                averages[3][local_id],
            ]})
        })
    }, 10)
}

// Create an import button
const row = document.querySelector("div.flex.justify-self-start.items-center")
const cbutton_container = row.cloneNode(false)
row.after(cbutton_container)
cbutton_container.innerHTML = `
<a
    href="https://osipog.github.io/bester-durchschnitt-app?export=derabirechner"
    style="border-radius: 0.3rem !important;border-style:none;background-color:#1a68c6;color:white;padding: 0.4rem 0.5rem 0.4rem 0.5rem;margin-top:0.6rem"
>Import von bester.durchschnitt</a>
`

try {
    if (window.location.href.includes("?import=") || localStorage["bestes-abi"]) {
        // Get the object from the url params
        let json_string;

        if (window.location.href.includes("?import=")) {
            [new_href, json_string] = decodeURI(window.location.href).split("?import=")
            localStorage["bestes-abi"] = json_string
            window.location.href = new_href
        }
        else if (localStorage["bestes-abi"]) {
            json_string = localStorage["bestes-abi"]
        }

        const [averages, subjects] = JSON.parse(json_string)
        insertGrades(averages, subjects)

        document.body.addEventListener("click", () => insertGrades(averages, subjects))
    }
}
catch (e) {
    alert("Beim Importieren der Noten ist ein Fehler aufgetreten: " + e)
}