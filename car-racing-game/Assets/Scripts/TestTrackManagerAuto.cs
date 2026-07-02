using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class TestTrackManagerAuto : MonoBehaviour
{
    private GameObject[] checkpoints;
    private Text lapText;
    private Text timeText;
    private Text bestTimeText;
    private GameObject finishPanel;
    private Button restartButton;
    private Button menuButton;
    
    private int currentCheckpoint = 0;
    private int currentLap = 0;
    private int totalLaps = 2;
    private float currentTime = 0f;
    private float bestTime = Mathf.Infinity;
    private bool raceActive = false;
    private bool raceStarted = false;
    
    void Start()
    {
        AutoFindUI();
    }
    
    void AutoFindUI()
    {
        lapText = GameObject.Find("LapText")?.GetComponent<Text>();
        timeText = GameObject.Find("TimeText")?.GetComponent<Text>();
        bestTimeText = GameObject.Find("BestTimeText")?.GetComponent<Text>();
        finishPanel = GameObject.Find("FinishPanel");
        restartButton = GameObject.Find("RestartButton")?.GetComponent<Button>();
        menuButton = GameObject.Find("MenuButton")?.GetComponent<Button>();

        // Buscar botón Exit
        Button exitButton = GameObject.Find("ExitButton")?.GetComponent<Button>();

        if (finishPanel) finishPanel.SetActive(false);
        if (restartButton) restartButton.onClick.AddListener(RestartRace);
        if (menuButton) menuButton.onClick.AddListener(GoToMenu);
        if (exitButton) exitButton.onClick.AddListener(GoToCarSelection); // ← NUEVO
    }
    
    public void SetCheckpoints(GameObject[] checkpointArray)
    {
        checkpoints = checkpointArray;
        Debug.Log($"✓ {checkpoints.Length} checkpoints asignados");
    }
    
    void Update()
    {
        if (raceActive)
        {
            currentTime += Time.deltaTime;
            UpdateUI();
        }
    }
    
    public void PassCheckpoint(int index)
    {
        // Primer checkpoint activa la carrera
        if (!raceStarted && index == 0)
        {
            raceStarted = true;
            raceActive = true;
            currentCheckpoint = 1;
            Debug.Log("¡Carrera iniciada!");
            return;
        }
        
        if (!raceActive) return;
        
        // Verificar orden correcto
        if (index == currentCheckpoint)
        {
            currentCheckpoint++;
            
            // Completar vuelta
            if (currentCheckpoint >= checkpoints.Length)
            {
                CompleteLap();
            }
        }
    }
    
    void CompleteLap()
    {
        currentCheckpoint = 0;
        currentLap++;
        
        Debug.Log($"Vuelta {currentLap} completada!");
        
        if (currentLap >= totalLaps)
        {
            FinishRace();
        }
    }
    
    void FinishRace()
    {
        raceActive = false;
        
        if (currentTime < bestTime)
        {
            bestTime = currentTime;
        }
        
        if (finishPanel) finishPanel.SetActive(true);
        
        Debug.Log($"¡Carrera finalizada! Tiempo: {FormatTime(currentTime)}");
    }
    
    void UpdateUI()
    {
        if (lapText)
            lapText.text = $"Vuelta: {currentLap + 1}/{totalLaps}";
        
        if (timeText)
            timeText.text = $"Tiempo: {FormatTime(currentTime)}";
        
        if (bestTimeText && bestTime < Mathf.Infinity)
            bestTimeText.text = $"Mejor: {FormatTime(bestTime)}";
    }
    
    string FormatTime(float time)
    {
        int minutes = Mathf.FloorToInt(time / 60f);
        int seconds = Mathf.FloorToInt(time % 60f);
        int milliseconds = Mathf.FloorToInt((time * 100f) % 100f);
        return $"{minutes:00}:{seconds:00}:{milliseconds:00}";
    }
    
    void RestartRace()
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