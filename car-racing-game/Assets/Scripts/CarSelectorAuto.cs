using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Linq;

public class CarSelectorAuto : MonoBehaviour
{
    [Header("Asignar Coches Manualmente Aquí")]
    [Tooltip("Arrastra los 8 modelos de coches aquí")]
    public GameObject[] carPrefabs; // ← AHORA ES PÚBLICO
    
    [Header("UI (Auto-detectada)")]
    private Text carNameText;
    private Button leftButton;
    private Button rightButton;
    private Button selectButton;
    
    private int currentCarIndex = 0;
    private GameObject currentCarDisplay;
    
    void Start()
    {
        // Si no hay coches asignados manualmente, intentar auto-detectar
        if (carPrefabs == null || carPrefabs.Length == 0)
        {
            Debug.LogWarning("No hay coches asignados manualmente. Intentando auto-detectar...");
            AutoFindCars();
        }
        else
        {
            Debug.Log($"✓ {carPrefabs.Length} coches asignados manualmente");
        }
        
        // Auto-encontrar UI
        AutoFindUI();
        
        // Configurar botones
        if (leftButton) leftButton.onClick.AddListener(PreviousCar);
        if (rightButton) rightButton.onClick.AddListener(NextCar);
        if (selectButton) selectButton.onClick.AddListener(SelectCar);
        
        // Mostrar primer coche
        if (carPrefabs != null && carPrefabs.Length > 0)
        {
            ShowCar(currentCarIndex);
        }
        else
        {
            Debug.LogError("⚠ NO HAY COCHES DISPONIBLES. Por favor asigna los coches manualmente en el Inspector.");
        }
    }
    
    void AutoFindCars()
    {
        // Buscar todos los GameObjects en Resources o Assets que parezcan coches
        var allObjects = Resources.LoadAll<GameObject>("");
        var cars = allObjects.Where(obj => IsLikelyCar(obj)).ToArray();
        
        if (cars.Length == 0)
        {
            Debug.Log("No se encontraron coches automáticamente.");
        }
        else
        {
            carPrefabs = cars.Take(8).ToArray();
            Debug.Log($"Se encontraron {carPrefabs.Length} coches automáticamente");
        }
    }
    
    bool IsLikelyCar(GameObject obj)
    {
        string name = obj.name.ToLower();
        if (name.Contains("car") || name.Contains("vehicle") || name.Contains("auto"))
            return true;
            
        Transform[] children = obj.GetComponentsInChildren<Transform>();
        int wheelCount = 0;
        
        foreach (Transform child in children)
        {
            if (child.name.ToLower().Contains("wheel"))
                wheelCount++;
        }
        
        return wheelCount >= 2;
    }
    
    void AutoFindUI()
    {
        carNameText = GameObject.Find("CarNameText")?.GetComponent<Text>();
        leftButton = GameObject.Find("LeftButton")?.GetComponent<Button>();
        rightButton = GameObject.Find("RightButton")?.GetComponent<Button>();
        selectButton = GameObject.Find("SelectButton")?.GetComponent<Button>();
    }
    
    void ShowCar(int index)
    {
        if (currentCarDisplay != null)
            Destroy(currentCarDisplay);
    
        // Rotación de 180° + 30° para mejor vista = 210°
        currentCarDisplay = Instantiate(carPrefabs[index], Vector3.zero, Quaternion.Euler(0, 210, 0));
    
        if (carNameText)
            carNameText.text = carPrefabs[index].name;
    }
    
    public void NextCar()
    {
        currentCarIndex = (currentCarIndex + 1) % carPrefabs.Length;
        ShowCar(currentCarIndex);
    }
    
    public void PreviousCar()
    {
        currentCarIndex--;
        if (currentCarIndex < 0) currentCarIndex = carPrefabs.Length - 1;
        ShowCar(currentCarIndex);
    }
    
    public void SelectCar()
    {
        PlayerPrefs.SetInt("SelectedCarIndex", currentCarIndex);
        PlayerPrefs.SetString("SelectedCarName", carPrefabs[currentCarIndex].name);
        PlayerPrefs.Save();
        
        SceneManager.LoadScene("MainMenu");
    }
}
