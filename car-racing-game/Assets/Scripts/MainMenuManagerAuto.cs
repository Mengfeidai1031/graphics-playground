using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class MainMenuManagerAuto : MonoBehaviour
{
    private Button coinGameButton;
    private Button testTrackButton;
    
    void Start()
    {
        AutoFindUI();
        
        if (coinGameButton) coinGameButton.onClick.AddListener(LoadCoinGame);
        if (testTrackButton) testTrackButton.onClick.AddListener(LoadTestTrack);
    }
    
    void AutoFindUI()
    {
        coinGameButton = GameObject.Find("CoinGameButton")?.GetComponent<Button>();
        testTrackButton = GameObject.Find("TestTrackButton")?.GetComponent<Button>();
    }
    
    void LoadCoinGame()
    {
        SceneManager.LoadScene("CoinCollection");
    }
    
    void LoadTestTrack()
    {
        SceneManager.LoadScene("TestTrack");
    }
}