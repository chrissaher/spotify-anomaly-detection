import numpy as np
import pandas as pd
#import matplotlib.pyplot as plt
#import seaborn as sns
import util
from io import StringIO
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from scipy.stats import multivariate_normal

class AnomalyDetector(object):
	def __init__(self, threshold = 0.028):
		self.threshold = threshold

	def fit(self, X):

		# From string to dataframe
		df = pd.read_csv(StringIO(X), sep = ",")

		# danceability
		df["DanInt"] = pd.cut(df["danceability"], 10)
		df["DanInt"] = df["danceability"].apply(lambda x: util.getDanceabilityIndex(x))
		df = df.drop("danceability", axis = 1)

		# energy
		df["EneInt"] = df["energy"].apply(lambda x: util.getEnergyIndex(x))
		df = df.drop("energy", axis = 1)

		# Key & Mode
		df["KeyInt"] = df["key"]
		df["ModInt"] = df["mode"]
		df = df.drop("key", axis = 1)
		df = df.drop("mode", axis = 1)

		# Loudness
		df["LouInt"] = pd.cut(df["loudness"], 5)
		df["LouInt"] = df["loudness"].apply(lambda x: util.getLoudnessIndex(x))
		df = df.drop("loudness", axis = 1)

		# Speechiness
		df["SpeInt"] = df["speechiness"].apply(lambda x: util.getSpeechinessIndex(x))
		df = df.drop("speechiness", axis = 1)

		# Acousticness
		df["AcoInt"] = df["acousticness"].apply(lambda x: util.getAcousticnessIndex(x))
		df = df.drop("acousticness", axis = 1)

		# Instrumentalness
		df["InsInt"] = df["instrumentalness"].apply(lambda x: util.getInstrumentalnessIndex(x))
		df = df.drop("instrumentalness", axis = 1)

		# Liveness
		df["LivInt"] = df["liveness"].apply(lambda x: util.getLivenessIndex(x))
		df = df.drop("liveness", axis = 1)

		# Valence
		df["ValInt"] = df["valence"].apply(lambda x: util.getValencenessIndex(x))
		df = df.drop("valence", axis = 1)

		# Tempo
		df["TemInt"] = df["tempo"].apply(lambda x: x**0.5)
		df["TemInt"] = pd.cut(df["TemInt"], 10)
		df["TemInt"] = df["tempo"].apply(lambda x: util.getTempoIndex(x))
		df = df.drop("tempo", axis = 1)

		# Deleten unnecessary columns
		df = df.drop(["ModInt", "KeyInt", "LouInt", "duration_ms", "time_signature"], axis = 1)

		# PCA
		trainer = df.drop("id", axis = 1)
		scaler = StandardScaler()
		scaler.fit(trainer)
		scaled_data = scaler.transform(trainer)
		pca = PCA(n_components=2)
		pca.fit(scaled_data)
		x_pca = pca.transform(scaled_data)
		ndf = pd.DataFrame(x_pca, columns =["p1", "p2"])
		ndf = ndf.drop("p2", axis = 1)

		# Anomaly Detection
		mu, sigma = self.estimateGaussian(ndf)
		p = self.multivariateGaussian(ndf,mu,sigma)
		outliers = np.asarray(np.where(p < self.threshold))

		res = "";
		arr = df.iloc[outliers[0]]["id"]
		for item in arr:
			res = res + item + ","
		return res

	def estimateGaussian(self, dataset):
		mu = np.mean(dataset, axis=0)
		sigma = np.cov(dataset.T)
		return mu, sigma

	def multivariateGaussian(self, dataset, mu, sigma):
		p = multivariate_normal(mean=mu, cov=sigma)
		return p.pdf(dataset)

	def selectThresholdByCV(probs,gt):
		best_epsilon = 0
		best_f1 = 0
		f = 0
		stepsize = (max(probs) - min(probs)) / 1000;
		epsilons = np.arange(min(probs),max(probs),stepsize)
		for epsilon in np.nditer(epsilons):
			predictions = (probs < epsilon)
			f = f1_score(gt, predictions, average = "binary")
			if f > best_f1:
				best_f1 = f
				best_epsilon = epsilon
		return best_f1, best_epsilon
