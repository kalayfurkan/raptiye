document.getElementById('gradeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const studentGrade = parseFloat(document.getElementById('studentGrade').value);
    const classAverage = parseFloat(document.getElementById('classAverage').value);
    const standardDeviation = parseFloat(document.getElementById('standardDeviation').value);

    let letterGrade;
    if (studentGrade >= classAverage + 1.5 * standardDeviation) {
        letterGrade = 'A';
    } else if (studentGrade >= classAverage + 0.5 * standardDeviation) {
        letterGrade = 'B';
    } else if (studentGrade >= classAverage - 0.5 * standardDeviation) {
        letterGrade = 'C';
    } else if (studentGrade >= classAverage - 1.5 * standardDeviation) {
        letterGrade = 'D';
    } else {
        letterGrade = 'F';
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>Tahmini harf notunuz: ${letterGrade}</p>`;
    resultDiv.style.display = 'block';
});