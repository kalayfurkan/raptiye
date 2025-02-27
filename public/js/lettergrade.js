document.getElementById('gradeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const studentGrade = parseFloat(document.getElementById('studentGrade').value);
    const classAverage = parseFloat(document.getElementById('classAverage').value);
    const standardDeviation = parseFloat(document.getElementById('standardDeviation').value);

    let tScore = (10 * ((studentGrade - classAverage) / standardDeviation)) + 50;

    const gradeTable = [
        { interval: [80, 100], tscores: [57, 54, 52, 49, 47, 44, 42, 39, 37, 34, 32, 29, 27] },
        { interval: [70, 80], tscores: [59, 56, 54, 51, 49, 46, 44, 41, 39, 36, 34, 31, 29] },
        { interval: [62.5, 70], tscores: [61, 58, 56, 53, 51, 48, 46, 43, 41, 38, 36, 33, 31] },
        { interval: [57.5, 62.5], tscores: [63, 60, 58, 55, 53, 50, 48, 45, 43, 40, 38, 35, 33] },
        { interval: [52.5, 57.5], tscores: [65, 62, 60, 57, 55, 52, 50, 47, 45, 42, 40, 37, 35] },
        { interval: [47.5, 52.5], tscores: [67, 64, 62, 59, 57, 54, 52, 49, 47, 44, 42, 39, 37] },
        { interval: [42.5, 47.5], tscores: [69, 66, 64, 61, 59, 56, 54, 51, 49, 46, 44, 41, 39] },
        { interval: [-Infinity, 42.5], tscores: [71, 68, 66, 63, 61, 58, 56, 53, 51, 48, 46, 43, 41] }
    ];

    const letterGrades = ['AA', 'BA+', 'BA', 'BB+', 'BB', 'CB+', 'CB', 'CC+', 'CC', 'DC+', 'DC', 'DD+', 'DD', 'FF'];

    function calculateLetterGrade(classAverage, tscore) {
        const sinif = gradeTable.find(s => classAverage >= s.interval[0] && classAverage < s.interval[1]);

        if (sinif) {
            const index = sinif.tscores.findIndex(t => tscore >= t);
            return letterGrades[index !== -1 ? index : letterGrades.length - 1]; // Sonuç yoksa 'FF' döndürür
        }

        return 'FF'; // Sınıf ortalaması uygun değilse 'FF' döndürür
    }

    const letterGrade = calculateLetterGrade(classAverage, tScore)

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>Tahmini harf notunuz: ${letterGrade}</p>`;
    resultDiv.style.display = 'block';
});