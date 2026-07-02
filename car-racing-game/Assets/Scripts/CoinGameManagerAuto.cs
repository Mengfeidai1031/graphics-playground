using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections;
using System.Collections.Generic;

public class CoinGameManagerAuto : MonoBehaviour
{
    public static CoinGameManagerAuto instance;
    
    [Header("Auto-configuración")]
    public int totalCoins = 5;
    public float terrainSize = 400f;
    
    private GameObject coinPrefab;
    private List<GameObject> spawnedCoins = new List<GameObject>();
    
    private Text coinText;
    private Text timerText;
    private GameObject winPanel;
    private Button restartButton;
    private Button menuButton;
    
    private int coinsCollected = 0;
    private float gameTime = 0f;
    private bool gameActive = true;
    
    void Awake()
    {
        instance = this;
    }
    
    void Start()
    {
        AutoFindUI();
        CreateCoinPrefab();
        StartCoroutine(WaitAndSpawnCoins());
    }
    
    void AutoFindUI()
    {
        coinText = GameObject.Find("CoinText")?.GetComponent<Text>();
        timerText = GameObject.Find("TimerText")?.GetComponent<Text>();
        winPanel = GameObject.Find("WinPanel");
        restartButton = GameObject.Find("RestartButton")?.GetComponent<Button>();
        menuButton = GameObject.Find("MenuButton")?.GetComponent<Button>();

        // Buscar botón Exit
        Button exitButton = GameObject.Find("ExitButton")?.GetComponent<Button>();

        if (winPanel) winPanel.SetActive(false);
        if (restartButton) restartButton.onClick.AddListener(RestartGame);
        if (menuButton) menuButton.onClick.AddListener(GoToMenu);
        if (exitButton) exitButton.onClick.AddListener(GoToCarSelection); // ← NUEVO
    }
    
    void CreateCoinPrefab()
    {
        coinPrefab = new GameObject("Coin");
        
        // Crear cilindro dorado
        GameObject cylinder = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        cylinder.transform.SetParent(coinPrefab.transform);
        cylinder.transform.localPosition = Vector3.zero;
        cylinder.transform.localRotation = Quaternion.Euler(90, 0, 0);
        cylinder.transform.localScale = new Vector3(1.5f, 0.2f, 1.5f);
        
        Material goldMat = new Material(Shader.Find("Standard"));
        goldMat.color = new Color(1f, 0.84f, 0f);
        goldMat.SetFloat("_Metallic", 0.8f);
        goldMat.SetFloat("_Glossiness", 0.9f);
        cylinder.GetComponent<Renderer>().material = goldMat;
        
        // Añadir trigger collider
        SphereCollider trigger = coinPrefab.AddComponent<SphereCollider>();
        trigger.isTrigger = true;
        trigger.radius = 2f;
        
        // Añadir script de rotación y colección
        coinPrefab.AddComponent<CoinAuto>();
        
        // Añadir luz para que brille
        Light coinLight = coinPrefab.AddComponent<Light>();
        coinLight.color = new Color(1f, 0.84f, 0f);
        coinLight.range = 5f;
        coinLight.intensity = 2f;
    }
    
    IEnumerator WaitAndSpawnCoins()
    {
        // Esperar a que el terreno esté generado
        yield return new WaitForSeconds(1f);
        
        SpawnCoins();
    }
    
    void SpawnCoins()
    {
        for (int i = 0; i < totalCoins; i++)
        {
            Vector3 randomPos = GetRandomGroundPosition();
            GameObject coin = Instantiate(coinPrefab, randomPos, Quaternion.identity);
            spawnedCoins.Add(coin);
        }
        
        Debug.Log($"✓ {totalCoins} monedas generadas");
    }
    
    Vector3 GetRandomGroundPosition()
    {
        Vector3 randomPos = new Vector3(
            Random.Range(50f, terrainSize - 50f),
            50f,
            Random.Range(50f, terrainSize - 50f)
        );
        
        // Raycast hacia abajo para encontrar el suelo
        RaycastHit hit;
        if (Physics.Raycast(randomPos, Vector3.down, out hit, 100f))
        {
            return hit.point + Vector3.up * 2f;
        }
        
        return new Vector3(randomPos.x, 2f, randomPos.z);
    }
    
    void Update()
    {
        if (gameActive)
        {
            gameTime += Time.deltaTime;
            UpdateUI();
        }
    }
    
    public void CollectCoin()
    {
        coinsCollected++;
        UpdateUI();
        
        if (coinsCollected >= totalCoins)
        {
            WinGame();
        }
    }
    
    void WinGame()
    {
        gameActive = false;
        if (winPanel) winPanel.SetActive(true);
        
        Debug.Log($"¡Victoria! Tiempo: {gameTime:F2} segundos");
    }
    
    void UpdateUI()
    {
        if (coinText)
            coinText.text = $"Monedas: {coinsCollected}/{totalCoins}";
        
        if (timerText)
        {
            int minutes = Mathf.FloorToInt(gameTime / 60f);
            int seconds = Mathf.FloorToInt(gameTime % 60f);
            timerText.text = $"Tiempo: {minutes:00}:{seconds:00}";
        }
    }
    
    void RestartGame()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }
    
    void GoToMenu()
    {
        SceneManager.LoadScene("MainMenu");
    }

    void GoToCarSelection()
    {
        SceneManager.LoadScene("CarSelection");
    }
}