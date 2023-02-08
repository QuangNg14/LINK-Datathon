# Link
## Rice Datathon 2021

### Inspiration

Given the wealth of transaction data provided by Bill.com, we sought to identify vendor-to-vendor, agency-to-agency, and agency-to-vendor relationships that could be used to identify similar agencies and vendors. Specifically, our goal was to identify a quantitative method of measuring similarity among vendors and agencies in order to make custom-tailored recommendations.

### What it does

Link is able to suggest vendors within similar industries given the vendors it most often interacts with. You can enter the name of an agency, and gain access to a variety of analytics, including customer spending habits, most suitable industry, and vendors the agency interacts with the most. Recommendations of other vendors are also provided, as well as similar agencies based on spending habits and industry preference.

### How we built it

We establish similarities between vendors using Latent Dirichlet Allocation (LDA), which is a Bayesian bag-of-words approach to finding unifying topics for words. Each of the 450,000 transactions has a vendor with a list of descriptors, which we defined as its characteristics. Once we gathered and tokenized these characteristics for each vendor, we then ran it through our Bayesian model and concluded that the characteristics converged under six main topics, which we call industries. Our LDA model was able to slowly inch the characteristics’ probabilities for topics towards convergence, resulting in these characteristics, which is how we find similarities between vendors. We created the web app using the React framework and Google Firebase’s Realtime Database.

### Challenges we ran into

We ran into problems when attempting to apply a Gaussian mixture model on the dataset; our data converged to a single mean rather than two or more. We instead used the information we gained from the model to analyze similar behaviors within different agencies. Our model was then able to predict the amount spent per month given the average frequency between purchases at a significantly higher accuracy.

### Accomplishments that we're proud of

We were able to extract and clean the data to optimize it for Bayesian inference and LDA, create a mathematical model to test and quantify relationships among vendors and agencies, and build a user-friendly interface to display our results.

### What's next for Link

Given more time and resources, we’d want to iterate upon our model and improve it by feeding in more data and possibly exploring other models. We’d also want to continue to polish our interface so that agencies and vendors can better understand their analytics and make the most of our results.
