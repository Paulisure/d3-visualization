# Heart Disease Mortality Visualization

## Project Overview
This project focuses on visualizing heart disease mortality causes based on metadata and patient outcomes. The goal is to create an interactive visualization that allows users to explore the relationships between various factors and heart disease mortality.

## Motivation
This project was inspired by a personal connection to heart disease, as the creator's father-in-law was undergoing a heart transplant procedure. The aim was to learn more about the disease and create a visual tool similar to what was shown in the UpSet video, enabling easy selection and analysis of data from Excel.

## Data Source
The dataset used in this project was sourced from the [Kaggle Cardiovascular Disease Dataset](https://www.kaggle.com/datasets/cardiovasculardisease).

## Visualization Design
The main visualization is a "Brushable scatterplot matrix" that allows users to:
- Plot all data in a matrix format
- Select clusters of data
- Observe how the selected data is affected by various factors

An additional interactive bar chart was implemented to show the impact factors of different characteristics, ranging from highest to lowest impact.

## Key Findings
The visualization revealed several interesting insights, including:
1. Lower sodium levels in the blood correlated with higher mortality rates, contrary to common medical advice.
2. Meaningful thresholds were identified for various factors:
   - Non-death events: Age < 80
   - Death events: Creatinine > 2, Ejection fraction < 30, Sodium levels < 135
3. Combinations of factors (e.g., smoking, high blood pressure, and diabetes) showed more significant impacts than individual factors alone.

## How to Use
[Include instructions on how to run or access the visualization]

## Video Presentation
For a detailed explanation of the project and its findings, watch the narrated video:

[![Heart Disease Mortality Visualization](https://img.youtube.com/vi/c-NpIGo31B4/0.jpg)](https://www.youtube.com/watch?v=c-NpIGo31B4)

## Future Work
This visualization template has potential for broader applications in data analysis and could be adapted for use with other datasets.

## Author
Paul Loupe

## Acknowledgments
- Kaggle for providing the cardiovascular disease dataset
- Inspiration from the UpSet visualization technique

