def getDanceabilityIndex(x):
	if x <= 0.268:
		return 1
	if x <= 0.345:
		return 2
	if x <= 0.421:
		return 3
	if x <= 0.498:
		return 4
	if x <= 0.574:
		return 5
	if x <= 0.65:
		return 6
	if x <= 0.727:
		return 7
	if x < 0.803:
		return 8
	if x < 0.88:
		return 9
	return 10

def getEnergyIndex(x):
	for i in range(11):
		if x < 0.1 * i:
			return i

def getLoudnessIndex(x):
	for i in range (1, 60):
		if x > -5 * i:
			return i

def getSpeechinessIndex(x):
	for i in range(11):
		if x < 0.10 * i:
			return i

def getAcousticnessIndex(x):
	for i in range(11):
		if x < 0.1 * i:
			return i

def getInstrumentalnessIndex(x):
	for i in range(11):
		if x < 0.1 * i:
			return i

def getLivenessIndex(x):
	for i in range(11):
		if x < 0.1 * i:
			return i

def getValencenessIndex(x):
	for i in range(11):
		if x < 0.1 * i:
			return i

def getTempoIndex(x):
	x = x**0.5
	if x <= 9.144:
		return 1
	if x <= 9.674:
		return 2
	if x <= 10.204:
		return 3
	if x <= 10.734:
		return 4
	if x <= 11.263:
		return 5
	if x <= 11.793:
		return 6
	if x <= 12.323:
		return 7
	if x <= 12.852:
		return 8
	if x <= 13.382:
		return 9
	return 10
