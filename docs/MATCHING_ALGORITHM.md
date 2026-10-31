# FoodRescue AI — 5-Factor Explainable Matching Algorithm Specification

## Mathematical Formulation

The matching score $S(F, R)$ between a Food Submission $F$ and a Recipient $R$ is calculated as a weighted linear combination of five normalized contextual factors:

$$S(F, R) = C_{\text{cat}} + N_{\text{need}} + K_{\text{cap}} + D_{\text{dist}} + A_{\text{avail}}$$

Where:
- $C_{\text{cat}} \in [5, 25]$: Category Compatibility Score
- $N_{\text{need}} \in [10, 25]$: Recipient Need Level Score
- $K_{\text{cap}} \in [6, 20]$: Capacity Match Score
- $D_{\text{dist}} \in [3, 15]$: Proximity / Distance Score
- $A_{\text{avail}} \in [11, 15]$: Usability Window & Operating Hours Match Score

Overall Match Score $S \in [0, 100]$.

---

## Factor Breakdown

### 1. Category Compatibility ($C_{\text{cat}}$ - Max 25 pts)
$$\begin{cases} 25 & \text{if Category}(F) \in \text{AcceptedCategories}(R) \\ 5 & \text{otherwise} \end{cases}$$

### 2. Recipient Need Level ($N_{\text{need}}$ - Max 25 pts)
$$\begin{cases} 
25 & \text{if Need Level} = \text{CRITICAL} \\ 
20 & \text{if Need Level} = \text{HIGH} \\ 
15 & \text{if Need Level} = \text{MEDIUM} \\ 
10 & \text{if Need Level} = \text{LOW} 
\end{cases}$$

### 3. Capacity Match ($K_{\text{cap}}$ - Max 20 pts)
Defined by the capacity ratio $r = \frac{\text{Capacity}(R)}{\text{Servings}(F)}$:
$$\begin{cases} 
20 & \text{if } r \ge 1.0 \\ 
16 & \text{if } 0.7 \le r < 1.0 \\ 
12 & \text{if } 0.4 \le r < 0.7 \\ 
6 & \text{if } r < 0.4 
\end{cases}$$

### 4. Proximity / Distance ($D_{\text{dist}}$ - Max 15 pts)
$$\begin{cases} 
15 & \text{if Distance} \le 3\text{ km} \\ 
12 & \text{if } 3\text{ km} < \text{Distance} \le 6\text{ km} \\ 
9 & \text{if } 6\text{ km} < \text{Distance} \le 10\text{ km} \\ 
6 & \text{if } 10\text{ km} < \text{Distance} \le 15\text{ km} \\ 
3 & \text{if Distance} > 15\text{ km} 
\end{cases}$$

### 5. Operating Hours & Urgency Window ($A_{\text{avail}}$ - Max 15 pts)
$$\begin{cases} 
15 & \text{if Urgency}(F) = \text{CRITICAL} \land \text{Need}(R) = \text{CRITICAL} \\ 
13 & \text{if Urgency}(F) = \text{HIGH} \\ 
11 & \text{otherwise} 
\end{cases}$$

---

## Suitability Classification

- **OPTIMAL**: $S \ge 85\%$
- **GOOD**: $70\% \le S < 85\%$
- **MODERATE**: $50\% \le S < 70\%$
- **POOR**: $S < 50\%$
