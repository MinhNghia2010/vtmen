package com.vtmen.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vtmen.robot")
public class RobotTaskProperties {

    /**
     * Full URL for DCS send-task (VtMen).
     */
    private String sendTaskUrl = "http://223.130.11.193:10101/api/dcs/sendtaskVtMen";

    /** Used when request does not specify robot_id. */
    private String defaultRobotId = "CB20608BAK00001";

    /** Default destination.name in the robot payload. */
    private String defaultDestinationName = "Đại học Thủy Lợi";

    public String getSendTaskUrl() {
        return sendTaskUrl;
    }

    public void setSendTaskUrl(String sendTaskUrl) {
        this.sendTaskUrl = sendTaskUrl;
    }

    public String getDefaultRobotId() {
        return defaultRobotId;
    }

    public void setDefaultRobotId(String defaultRobotId) {
        this.defaultRobotId = defaultRobotId;
    }

    public String getDefaultDestinationName() {
        return defaultDestinationName;
    }

    public void setDefaultDestinationName(String defaultDestinationName) {
        this.defaultDestinationName = defaultDestinationName;
    }
}
