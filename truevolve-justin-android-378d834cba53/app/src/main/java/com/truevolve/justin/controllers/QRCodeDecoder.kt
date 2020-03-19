package com.truevolve.justin.controllers

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.google.gson.Gson
import com.truevolve.enact.Interpreter
import com.truevolve.enact.controllers.ActivityBaseController
import com.truevolve.enact.exceptions.PolicyException
import com.truevolve.justin.R
import com.truevolve.justin.datamodels.DecodeException
import com.truevolve.justin.datamodels.IDCard
import com.truevolve.justin.tools.Flogger
import org.json.JSONObject


class IDCardDecoder : ActivityBaseController() {

    private val TAG = "IDCardDecoder"
    private val TYPE = "id_card_decode_display"
    private val RETRIEVE_AS = "retrieve_as"
    private val STORE_AS = "store_as"
    private val ON_OK = "on_ok"
    private val ON_CANCEL = "on_cancel"
    private val ON_DECODE_ERROR = "on_decode_error"
    private val CANCEL_TEXT = "cancel_text"
    private val DISPLAY_MESSAGE = "display_message"

    //QRCODE DETAILS
    private val QRCODE_RETRIEVE_AS = "qrcode_retrieve_as"
    private val QRCODE_STORE_AS = "qrcode_store_as"
    private val QRCODE_DISPLAY_MESSAGE = "qrcode_display_message"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_id_card_decoder)

        val data = Interpreter.dataStore

        try {
            val raw = stateObj?.getString(RETRIEVE_AS)?.let { data.getProperty<ByteArray>(it) }

            var toStr = raw?.let { String(it) }
            Flogger.d("Receivd [$toStr]")


            // The Code39 barcode on the ID Cards for some reason have asterisks padding
            if (toStr?.startsWith("*") == true && toStr.endsWith("*")) {
                toStr = toStr.removeSurrounding("*", "*")
                Flogger.d("Stripping out prefix and suffix *, now we have [$toStr]")
            }

            // Validate if barcode scanned its ID card or
            // QR CODE
            if (toStr?.contains("|") == false && toStr.length != 13) {
                // Error if not ID number or ID Card string
                //throw DecodeException("Not an id card."
                //Getting id_card_entry layout template
                val displayMessageText = findViewById<TextView>(R.id.displayMessageText)
                displayMessageText.text = "QRCODE DETAILS"
                val layout = findViewById<LinearLayout>(R.id.container_all)

                //Pushing Data to id_card_entry layout template
                var child = layoutInflater.inflate(R.layout.id_card_entry, null)

                // Push QRCODE Text to Layout
                child.findViewById<TextView>(R.id.text_title).text = "Results" ;
                child.findViewById<TextView>(R.id.text_value).text = toStr;
                // Adding view
                layout.addView(child)

            } else {
                val scannedID = toStr?.let { IDCard(it) }

                stateObj?.getString(STORE_AS)?.let {
                    if (scannedID != null) {
                        data.put(it, scannedID)
                    }
                }

                val displayMessageText = findViewById<TextView>(R.id.displayMessageText)
                displayMessageText.text = stateObj?.getString(DISPLAY_MESSAGE)

                val layout = findViewById<LinearLayout>(R.id.container_all)

                var child = layoutInflater.inflate(R.layout.id_card_entry, null)

                scannedID?.surname?.let { surname ->
                    child.findViewById<TextView>(R.id.text_title).text = getString(R.string.card_title_surname)
                    child.findViewById<TextView>(R.id.text_value).text = surname
                    layout.addView(child)
                }

                scannedID?.names?.let { names ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_names)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = names
                    layout.addView(child)
                }

                scannedID?.sex?.let { sex ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_gender)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = sex
                    layout.addView(child)
                }

                scannedID?.nationality?.let { nationality ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_nationality)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = nationality
                    layout.addView(child)
                }

                scannedID?.id_number?.let { id_number ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_id_number)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = id_number
                    layout.addView(child)
                }

                scannedID?.date_of_birth?.let { date_of_birth ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_date_of_birth)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = date_of_birth
                    layout.addView(child)
                }

                scannedID?.country_of_birth?.let { country_of_birth ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_country_of_birth)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = country_of_birth
                    layout.addView(child)
                }

                scannedID?.status?.let { status ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_status)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = status
                    layout.addView(child)
                }

                scannedID?.date_of_issue?.let { date_of_issue ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_date_of_issue)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = date_of_issue
                    layout.addView(child)
                }

                scannedID?.security_code?.let { security_code ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_security_code)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = security_code
                    layout.addView(child)
                }

                scannedID?.card_number?.let { card_number ->
                    child = layoutInflater.inflate(R.layout.id_card_entry, null)
                    (child.findViewById<View>(R.id.text_title) as TextView).text = getString(R.string.card_title_card_number)
                    (child.findViewById<View>(R.id.text_value) as TextView).text = card_number
                    layout.addView(child)
                }

            }

            findViewById<View>(R.id.okButton).setOnClickListener {
                try {
                    stateObj?.getString(ON_OK)?.let { goToState(it) }
                } catch (e: Exception) {
                    e.printStackTrace()
                    Flogger.e("Could not go to next state.", e)
                    Interpreter.error(this@IDCardDecoder, e)
                }
            }

            val cancelButton = findViewById<Button>(R.id.cancelButton)
            cancelButton.text = stateObj?.getString(CANCEL_TEXT)

            cancelButton.setOnClickListener {
                try {
                    stateObj?.getString(ON_CANCEL)?.let { goToState(it) }
                } catch (e: Exception) {
                    e.printStackTrace()
                    Flogger.e("Could not go to next state.", e)
                    Interpreter.error(this@IDCardDecoder, e)
                }
            }


        } catch (e: DecodeException) {
            Flogger.e("Decode error: ", e)
            stateObj?.getString(ON_DECODE_ERROR)?.let { goToState(it) }
        } catch (e: Exception) {
            e.printStackTrace()
            Flogger.e("onCreate: ", e)

            val dataStoreDump = Gson().toJson(Interpreter.dataStore)
            Flogger.e("onCreate: DATA STORE DUMP -> $dataStoreDump")

            Interpreter.error(this, e)
        }

    }

    override val type = TYPE


    @Throws(PolicyException::class)
    override fun validate(jsonObject: JSONObject) {
        if (!jsonObject.has(RETRIEVE_AS)) {
            Flogger.e("validate: state object must have $RETRIEVE_AS defined")
            throw PolicyException("$TYPE's state object must have $RETRIEVE_AS defined")

        } else if (!jsonObject.has(STORE_AS)) {
            Flogger.e("validate: state object must have $STORE_AS defined")
            throw PolicyException("$TYPE's state object must have $STORE_AS defined")

        } else if (!jsonObject.has(ON_OK)) {
            Flogger.e("validate: state object must have $ON_OK defined")
            throw PolicyException("$TYPE's state object must have $ON_OK defined")

        } else if (!jsonObject.has(ON_CANCEL)) {
            Flogger.e("validate: state object must have $ON_CANCEL defined")
            throw PolicyException("$TYPE's state object must have $ON_CANCEL defined")

        } else if (!jsonObject.has(CANCEL_TEXT)) {
            Flogger.e("validate: state object must have $CANCEL_TEXT defined")
            throw PolicyException("$TYPE's state object must have $CANCEL_TEXT defined")

        } else if (!jsonObject.has(DISPLAY_MESSAGE)) {
            Flogger.e("validate: state object must have $DISPLAY_MESSAGE defined")
            throw PolicyException("$TYPE's state object must have $DISPLAY_MESSAGE defined")
        }
    }

}
