document.addEventListener('DOMContentLoaded', () => {
    const dragArea = document.getElementById('dragArea');
    const fileInput = document.getElementById('fileInput');
    const promptInput = document.getElementById('promptInput');
    const submitButton = document.getElementById('submitButton');
    const resultArea = document.getElementById('resultArea');
    const outputImage = document.getElementById('outputImage');

    let uploadedImage = null;

    dragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.classList.add('active');
    });

    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('active');
    });

    dragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.classList.remove('active');
        handleFile(e.dataTransfer.files[0]);
    });

    dragArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    submitButton.addEventListener('click', async () => {
        if (!uploadedImage) {
            showAlert('Please upload an image first.', 'danger');
            return;
        }

        const prompt = promptInput.value.trim();
        if (!prompt) {
            showAlert('Please enter a prompt.', 'danger');
            return;
        }

        resultArea.classList.remove('d-none');
        outputImage.innerHTML = '<p class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Generating image... Please wait.</p>';

        try {
            const response = await fetch('/generate', {  // Update this URL to match your Flask route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: uploadedImage,
                    prompt: prompt
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }

            outputImage.innerHTML = `<img src="${result.image}" alt="Generated Image" class="img-fluid">`;
            showAlert('Image generated successfully!', 'success');
        } catch (error) {
            console.error('Error:', error);
            outputImage.innerHTML = '<p class="text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Error generating image. Please try again.</p>';
            showAlert(`Error: ${error.message}`, 'danger');
        }
    });

    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result;
                dragArea.innerHTML = `<img src="${uploadedImage}" alt="Uploaded Image" class="img-fluid">`;
                showAlert('Image uploaded successfully!', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            showAlert('Please upload a valid image file.', 'danger');
        }
    }

    function showAlert(message, type) {
        const alertPlaceholder = document.createElement('div');
        alertPlaceholder.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        document.querySelector('.container').insertBefore(alertPlaceholder, document.querySelector('.container').firstChild);

        // Auto-dismiss the alert after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertPlaceholder.firstChild);
            alert.close();
        }, 5000);
    }
});