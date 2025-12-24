# Robson Cassiano Portfolio

Personal portfolio and hub of information for **Robson Cassiano**, a Senior Software Engineer, International Career Mentor, and Entrepreneur.

This project is built with a focus on high performance, modern web standards, and advanced SEO/AEO optimizations.

## 🚀 Technologies

- **Angular 21**: Modern framework for building high-performance web applications.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **TypeScript**: Typed superset of JavaScript.
- **Vite**: Next-generation frontend tooling.
- **Reactive Extensions (RxJS)**: For handling asynchronous data streams.

## ✨ Key Features

- **SEO & AEO Optimized**: Implements advanced Search Engine Optimization and Answer Engine Optimization (Google, ChatGPT, Perplexity).
- **Structured Data**: Comprehensive JSON-LD implementation (Schema.org Person, FAQPage, BreadcrumbList).
- **Semantic HTML5**: Modern and accessible structure.
- **Internationalization Ready**: Content highlighting Robson's polyglot skills (English, Portuguese, Japanese, Latin, Ancient Greek).
- **Modern UI/UX**: Sleek, dark-themed design using Tailwind CSS.

## 🛠️ Local Development

### Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/robson-cassiano-portfolio.git
   cd robson-cassiano-portfolio
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```
   The app will be available at `http://localhost:4200/`.

4. **Build for production:**
   ```bash
   bun run build
   ```

## 🌐 GitHub Pages Deployment

To run this site on GitHub Pages, follow these steps:

1.  **Configure GitHub Pages:**
    *   Go to your repository on GitHub.
    *   Navigate to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.

2.  **Automatic Deployment:**
    *   The project includes a GitHub Action (`.github/workflows/deploy.yml`) that automatically builds and deploys the site whenever you push to the `main` branch.
    *   Ensure the `base-href` in the workflow matches your repository name (currently set to `/robson-cassiano-portfolio/`).

3.  **Manual Build (Optional):**
    *   If you want to build locally for manual deployment:
    ```bash
    bun run deploy
    ```
    *   The output will be in the `dist` folder.

## 📄 SEO & AEO Documentation

For detailed information on the SEO and AEO implementations, see [SEO-AEO-IMPLEMENTATION.md](SEO-AEO-IMPLEMENTATION.md).

## 👤 About Robson Cassiano

Senior Software Engineer specialized in Java Backend, founder of **Simple Software**, and mentor helping developers achieve international careers.

- **Website:** [eu.robsoncassiano.software](https://eu.robsoncassiano.software/)
- **LinkedIn:** [robsondev](https://www.linkedin.com/in/robsondev/)
- **X (Twitter):** [@RobsonDev](https://x.com/RobsonDev)

---

Developed by [Robson Cassiano](https://github.com/RobsonCassiano)
