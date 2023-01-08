input.addEventListener("change", () => {
    for (const file of input.files) {
        const obj = document.createElement("object");
        obj.data = URL.createObjectURL(file); obj.type = file.type;
        objects.appendChild(obj);
    }
});