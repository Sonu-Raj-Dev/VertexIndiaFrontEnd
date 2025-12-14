document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = this;

    const formData = {
        first_name: form.first_name.value.trim(),
        last_name: form.last_name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        product_interest: form.product_interest.value,
        message: form.message.value.trim()
    };

    if (!formData.first_name || !formData.email) {
        alert("Please fill required fields.");
        return;
    }

    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.innerText = "Sending...";

    try {
        // Use relative path - works on same domain (Vercel)
        // For local testing, ensure your dev server handles /api/sendmail
        const apiUrl = "/api/sendmail";
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            // If the server rejects the request (405, 500, etc.) log body for debugging
            const text = await response.text();
            console.error("Mail endpoint returned HTTP", response.status, text);
            alert("Request failed with status " + response.status + ". See console for details.");
            return;
        }

        // Try to parse JSON safely. Some servers (static servers) return empty responses.
        const contentType = response.headers.get("content-type") || "";
        let result = null;

        if (contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            // Non-JSON response — read as text and try to parse or log it
            const text = await response.text();
            try {
                result = JSON.parse(text || "null");
            } catch (e) {
                console.warn("Non-JSON response from mail endpoint:", text);
                alert("Server returned an unexpected response. See console for details.");
                return;
            }
        }

        if (result && result.success) {
            alert("Your inquiry has been sent successfully!");
            form.reset();
        } else {
            alert("Error: " + (result && result.message ? result.message : "Unknown error"));
        }
    } catch (error) {
        alert("Request failed. Please try again later.");
        console.error(error);
    }

    btn.disabled = false;
    btn.innerText = "Send Inquiry";
});
