# 🚀 DotProposal: AI-Driven Web Application for Automated Freelance Project Proposal Generation

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Gemini](https://img.shields.io/badge/Google%20Gemini%202.5%20Flash-8E75B2?style=for-the-badge)

##  Abstract
DotProposal is an AI-powered Software as a Service (SaaS) platform designed to optimize the bidding process for freelance software developers. Freelance software developers frequently encounter difficulties in accurately estimating project budgets and preparing customized proposals, which often leads to lost bids or underpriced projects. DotProposal solves this by utilizing a Random Forest Regressor to analyze historical freelance market data for accurate budget predictions. Concurrently, a Large Language Model (Google Gemini 2.5 Flash) dynamically generates professional cover letters.

##  System Architecture
The system is developed using a scalable microservices architecture. 
*   **Orchestrator:** A Node.js and Express.js main server manages database operations and drives the Retrieval-Augmented Generation (RAG) pipeline via the Google Gemini API.
*   **AI Service:** A Python FastAPI-based backend handles the analytical workload, exclusively executing the Random Forest-based price predictions.
*   **Communication:** Inter-service communication is handled via RabbitMQ to ensure reliable message brokering and synchronization.
*   **Data Sources:** The system fetches the developer's PDF resume from Cloudinary and retrieves the most recently updated repositories using the GitHub REST API.

##  Core AI Modules

### 1. Market Radar (Budget Estimation)
*   The predictive machine learning model utilizes a Random Forest Regressor.
*   The model was trained on a dataset comprising 1,200 real project records sourced from global freelance platforms.
*   Client job descriptions are converted into numerical matrices using the TF-IDF (Term Frequency-Inverse Document Frequency) method.
*   Extreme outliers over $300 were removed prior to training to prevent skewed predictions.
*   The Random Forest model achieved a 5-fold cross-validated Mean Absolute Error (MAE) of $20.90 and a Root Mean Square Error (RMSE) of $27.02.

### 2. RAG-Powered Proposal Generation
*   The system uses a Retrieval-Augmented Generation (RAG) architecture to synthesize the developer's live GitHub activity and Cloudinary-hosted CV data.
*   This dynamic context is merged into a strictly governed prompt payload that is processed by the Google Gemini API.
*   During generative quality evaluation, the Full RAG condition improved personalization by 55% and technical accuracy by 33% over a baseline Plain LLM prompt.
*   In a blind preference test, the Full RAG proposal was selected as the preferred bid in 80% of the tested scenarios.

##  Key Results and Impact
By bridging cost estimation, gig economy dynamics, and personalized AI within a unified microservices architecture, DotProposal successfully filters out market noise. The system generates reassuring proposals at market standards, protecting freelancers from the risk of extremely low or high pricing and enhancing their competitiveness within the global gig economy.

##  Academic Presentation and Conference Acceptance

The academic study forming the foundation of this project and detailing its underlying AI architecture has successfully passed peer review and was presented on an international platform.

<img width="865" height="672" alt="2008" src="https://github.com/user-attachments/assets/d6bbd40b-c2bb-44bb-b1c0-724d5c0598a8" />

* **Paper Title:** DotProposal: AI-Driven Web Application for Automated Freelance Project Proposal Generation and Budget Estimation
* **Authors:** Yusuf Gürsoy, Özge Aslan Yıldız
* **Conference:** ICETAI 2026 (3rd International Conference on Emerging Trends and Applications in Artificial Intelligence)
* **Date and Venue:** May 15-16, 2026, Istanbul Technical University (ITU), Turkey
* **Index:** Springer & Scopus

*(The scientific methodology and market analysis of the project were presented as a paper at this conference, contributing to the academic literature.)*
